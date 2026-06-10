import asyncio
import csv
import io
import logging
from datetime import datetime, timedelta
from celery import Celery
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from backend.app.core.config import settings
from backend.app.database.models import User, Challenge, ChallengeParticipant

logger = logging.getLogger("fitnaija.celery")

# Initialize Celery pointing to Redis broker and backend
celery = Celery(
    "fitnaija",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Celery Beat configurations for periodic tasks
celery.conf.beat_schedule = {
    "reconcile-trial-and-subscriptions-daily": {
        "task": "backend.app.celery_worker.reconcile_trials_and_subscriptions",
        "schedule": 86400.0, # Every 24 hours
    },
    "settle-completed-challenges-hourly": {
        "task": "backend.app.celery_worker.settle_completed_challenges",
        "schedule": 3600.0, # Every hour
    }
}
celery.conf.timezone = "Africa/Lagos"

# Recreate a dedicated async session maker for celery task execution
engine = create_async_engine(settings.DATABASE_URL)
async_session_maker = async_sessionmaker(bind=engine, expire_on_commit=False)

async def _reconcile_trials_and_subscriptions():
    """Inner async method to handle db reconciliations."""
    async with async_session_maker() as session:
        now = datetime.utcnow()
        
        # 1. Reconcile Trial Expirations
        trial_query = select(User).filter(
            User.status == "trial_active",
            User.trial_end <= now
        )
        expired_trials = (await session.execute(trial_query)).scalars().all()
        for user in expired_trials:
            user.status = "trial_expired"
            logger.info(f"User {user.phone} trial expired. Changed status to trial_expired.")

        # 2. Reconcile Subscription Expirations
        # In a real environment, we would poll RevenueCat subscriber endpoints.
        # For this prototype, we check users whose subscribed status has ended.
        sub_query = select(User).filter(
            User.status == "subscribed_active",
            User.trial_end <= now  # trial_end acts as subscription period end date
        )
        expired_subs = (await session.execute(sub_query)).scalars().all()
        for user in expired_subs:
            user.status = "subscription_expired"
            logger.info(f"User {user.phone} subscription expired. Changed status to subscription_expired.")
            
        await session.commit()

async def _settle_completed_challenges():
    """Inner async method to compile ledgers for challenges that ended > 48 hours ago."""
    async with async_session_maker() as session:
        now = datetime.utcnow()
        settlement_threshold = now - timedelta(hours=48)
        
        # Select challenges that ended > 48 hours ago and are not yet settled
        challenge_query = select(Challenge).filter(
            Challenge.end_date <= settlement_threshold,
            Challenge.status.in_(["active", "verification"])
        )
        completed_challenges = (await session.execute(challenge_query)).scalars().all()
        
        for challenge in completed_challenges:
            logger.info(f"Settling challenge: {challenge.title} ({challenge.id})")
            
            # Fetch participants sorted by total_steps desc, excluding cheaters
            participants_query = select(ChallengeParticipant, User).join(
                User, ChallengeParticipant.user_id == User.id
            ).filter(
                ChallengeParticipant.challenge_id == challenge.id,
                ChallengeParticipant.fraud_status.notin_(["hard_flag", "disqualified"])
            ).order_by(ChallengeParticipant.total_steps.desc())
            
            rows = (await session.execute(participants_query)).all()
            
            # Generate CSV ledger
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            writer.writerow(["Rank", "User ID", "Phone", "Display Name", "Location", "Total Steps", "Bank Name", "Account Number"])
            
            for rank, (part, user) in enumerate(rows, 1):
                writer.writerow([
                    rank,
                    str(user.id),
                    user.phone,
                    user.display_name or "Anonymous",
                    user.location,
                    part.total_steps,
                    user.bank_name or "N/A",
                    user.bank_account_number or "N/A"
                ])
            
            csv_content = csv_buffer.getvalue()
            csv_filename = f"ledgers/payout_ledger_{challenge.id}.csv"
            
            # In a real environment, we would save this to S3.
            # For this prototype, we print/log the generation and store locally.
            print(f"--- GENERATED PAYOUT LEDGER FOR CHALLENGE {challenge.id} ---")
            print(csv_content[:500]) # Print first few lines to stdout/logs
            print("-------------------------------------------------------------")
            
            # Update challenge status to settled
            challenge.status = "settled"
            
        await session.commit()

@celery.task
def reconcile_trials_and_subscriptions():
    """Celery task wrapper to execute async trial/subscription checks."""
    logger.info("Starting daily trial & subscription checks...")
    asyncio.run(_reconcile_trials_and_subscriptions())
    logger.info("Completed daily trial & subscription checks.")

@celery.task
def settle_completed_challenges():
    """Celery task wrapper to execute challenge settlement checks."""
    logger.info("Starting hourly challenge settlement check...")
    asyncio.run(_settle_completed_challenges())
    logger.info("Completed hourly challenge settlement check.")
