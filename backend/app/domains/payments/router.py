import hmac
import hashlib
import json
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Request, Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

from backend.app.database.session import get_db
from backend.app.database.models import Transaction, User, Challenge, ChallengeParticipant
from backend.app.core.config import settings
from backend.app.core.security import redis_client

router = APIRouter(prefix="/payments", tags=["Payments & Billings"])
logger = logging.getLogger("fitnaija.payments")

async def verify_paystack_signature(payload_bytes: bytes, signature: str) -> bool:
    """Validate incoming Paystack webhook HMAC SHA512 signature."""
    if not settings.PAYSTACK_SECRET_KEY or settings.PAYSTACK_SECRET_KEY == "your_paystack_secret_key_here":
        # Dev fallback: allow unsigned hooks for easy sandboxed testing
        return True
    
    hash_obj = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        payload_bytes,
        hashlib.sha512
    )
    expected = hash_obj.hexdigest()
    return hmac.compare_digest(expected, signature)

async def grant_revenuecat_entitlement(user_id: str):
    """Grant premium monthly access to user via RevenueCat REST API."""
    if not settings.REVENUECAT_API_KEY or settings.REVENUECAT_API_KEY == "your_revenuecat_api_key_here":
        logger.info(f"RevenueCat: bypassed promotional grant for user {user_id} (No API key)")
        return True

    url = f"https://api.revenuecat.com/v1/subscribers/{user_id}/entitlements/premium_monthly/promotional_grant"
    headers = {
        "Authorization": f"Bearer {settings.REVENUECAT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"duration": "monthly"}
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, headers=headers, json=payload, timeout=5.0)
            if res.status_code in (200, 201):
                logger.info(f"RevenueCat entitlement granted for user {user_id}")
                return True
            else:
                logger.error(f"RevenueCat error {res.status_code}: {res.text}")
    except Exception as e:
        logger.error(f"RevenueCat request failed: {str(e)}")
    return False

@router.post("/webhook/paystack", status_code=status.HTTP_200_OK)
async def paystack_webhook(
    request: Request,
    x_paystack_signature: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    body_bytes = await request.body()
    if not x_paystack_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature header")

    valid = await verify_paystack_signature(body_bytes, x_paystack_signature)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    payload = json.loads(body_bytes.decode('utf-8'))
    event = payload.get("event")
    data = payload.get("data", {})

    if event != "charge.success":
        # Ignore other event types for now
        return {"status": "ignored"}

    reference = data.get("reference")
    amount_cents = data.get("amount", 0)
    amount_naira = Decimal(str(amount_cents)) / 100

    # Prevent double-processing (Idempotency)
    tx_query = select(Transaction).filter(Transaction.reference == reference)
    existing_tx = (await db.execute(tx_query)).scalars().first()
    if existing_tx:
        return {"status": "success", "message": "Reference already processed"}

    # Extract metadata fields
    metadata = data.get("metadata", {})
    user_id = metadata.get("user_id")
    challenge_id = metadata.get("challenge_id")
    tx_type = metadata.get("transaction_type") # subscription or entry_fee

    if not user_id:
        # Fallback to query user by email/phone mapping
        customer_email = data.get("customer", {}).get("email", "")
        # Virtual email format: +234803...0@fitnaija.ng
        phone = customer_email.split("@")[0]
        user_res = await db.execute(select(User).filter(User.phone == phone))
        user = user_res.scalars().first()
    else:
        user_res = await db.execute(select(User).filter(User.id == uuid.UUID(user_id)))
        user = user_res.scalars().first()

    if not user:
        logger.error(f"Paystack success webhook triggered but customer user not found for reference {reference}")
        return {"status": "error", "message": "Customer user context not found"}

    # Register Transaction
    tx = Transaction(
        user_id=user.id,
        challenge_id=uuid.UUID(challenge_id) if challenge_id else None,
        amount=amount_naira,
        transaction_type=tx_type or "subscription",
        reference=reference,
        status="success"
    )
    db.add(tx)

    # 6. Process Subscription Entitlement
    if tx_type == "subscription" or not challenge_id:
        user.status = "subscribed_active"
        # Reset subscription period end to 30 days from now
        user.trial_end = datetime.utcnow() + timedelta(days=30)
        await db.commit()
        await grant_revenuecat_entitlement(str(user.id))
        logger.info(f"User {user.phone} successfully subscribed for ₦{amount_naira}")
        return {"status": "success", "message": "Subscription entitlement provisioned"}

    # 7. Process Challenge Entry Fee
    ch_uuid = uuid.UUID(challenge_id)
    ch_query = select(Challenge).filter(Challenge.id == ch_uuid)
    challenge = (await db.execute(ch_query)).scalars().first()
    
    if not challenge:
        logger.error(f"Challenge {challenge_id} not found for entry fee txn reference {reference}")
        return {"status": "error", "message": "Challenge context missing"}

    # Register Challenge Participant
    participant = ChallengeParticipant(
        challenge_id=ch_uuid,
        user_id=user.id,
        total_steps=0,
        fraud_status="clean"
    )
    db.add(participant)
    await db.commit()

    # Initialize leaderboard in Redis
    await redis_client.zadd(f"leaderboard:{challenge_id}", {str(user.id): 0})
    logger.info(f"User {user.phone} successfully joined paid challenge {challenge.title}")

    return {"status": "success", "message": "Challenge entry registered"}
