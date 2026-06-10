from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
import uuid
from decimal import Decimal

from backend.app.database.session import get_db
from backend.app.database.models import Challenge, ChallengeParticipant, User
from backend.app.domains.auth.deps import get_current_user, get_active_user
from backend.app.core.security import redis_client

router = APIRouter(prefix="/challenges", tags=["Challenges & Leaderboards"])

class ChallengeResponse(BaseModel):
    id: str
    title: str
    activity_type: str
    entry_fee: float
    prize_pool: float
    start_date: str
    end_date: str
    location_scope: str | None
    status: str
    participant_count: int

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    display_name: str
    location: str
    score: int

class LeaderboardResponse(BaseModel):
    top_entries: List[LeaderboardEntry]
    user_rank: Optional[LeaderboardEntry] = None

@router.get("", response_model=List[ChallengeResponse])
async def list_challenges(
    location: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List and filter challenges. Sorts upcoming first, then by participant count."""
    query = select(
        Challenge,
        func.count(ChallengeParticipant.user_id).label("participant_count")
    ).outerjoin(
        ChallengeParticipant, Challenge.id == ChallengeParticipant.challenge_id
    )

    if location:
        query = query.filter(Challenge.location_scope == location.strip().lower())

    query = query.group_by(Challenge.id).order_by(Challenge.start_date.desc())
    result = await db.execute(query)
    rows = result.all()

    challenges = []
    for row in rows:
        ch, p_count = row
        challenges.append({
            "id": str(ch.id),
            "title": ch.title,
            "activity_type": ch.activity_type,
            "entry_fee": float(ch.entry_fee),
            "prize_pool": float(ch.prize_pool),
            "start_date": ch.start_date.isoformat(),
            "end_date": ch.end_date.isoformat(),
            "location_scope": ch.location_scope,
            "status": ch.status,
            "participant_count": p_count
        })
    return challenges

@router.post("/{challenge_id}/join", status_code=status.HTTP_200_OK)
async def join_challenge(
    challenge_id: uuid.UUID,
    user: User = Depends(get_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Enables users to join free warmup challenges immediately, or returns invoice details for paid ones."""
    # Check if challenge exists
    result = await db.execute(select(Challenge).filter(Challenge.id == challenge_id))
    challenge = result.scalars().first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    if challenge.status != "upcoming" and challenge.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge is no longer open for entry")

    # Check if user already joined
    part_query = select(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == challenge_id,
        ChallengeParticipant.user_id == user.id
    )
    participant = (await db.execute(part_query)).scalars().first()
    if participant:
        return {"status": "joined", "message": "You are already a participant"}

    # Free Warmup Challenges
    if challenge.entry_fee == Decimal("0.00"):
        new_participant = ChallengeParticipant(
            challenge_id=challenge_id,
            user_id=user.id,
            total_steps=0,
            fraud_status="clean"
        )
        db.add(new_participant)
        await db.commit()

        # Initialize score on Redis Sorted Set
        await redis_client.zadd(f"leaderboard:{challenge_id}", {str(user.id): 0})
        return {"status": "joined", "message": "Successfully joined challenge"}

    # Paid Challenges -> Returns billing parameters for Paystack inline Modal
    # Payment processing webhooks will write ChallengeParticipant rows on success
    return {
        "status": "payment_required",
        "entry_fee": float(challenge.entry_fee),
        "paystack_key": settings.PAYSTACK_SECRET_KEY[:8] + "...", # Masked key reference
        "user_email": f"{user.phone}@fitnaija.ng", # Virtual Paystack customer
        "user_phone": user.phone
    }

@router.get("/{challenge_id}/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    challenge_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve top 50 participants from Redis Sorted Set and enrich with user profiles."""
    redis_key = f"leaderboard:{challenge_id}"
    
    # zrevrange returns list of (member, score)
    top_members = await redis_client.zrevrange(redis_key, 0, 49, withscores=True)
    
    # Retrieve user profile names from Postgres to build final response
    user_ids = [uuid.UUID(member) for member, _ in top_members]
    user_profiles = {}
    if user_ids:
        profiles_res = await db.execute(select(User).filter(User.id.in_(user_ids)))
        for p in profiles_res.scalars().all():
            user_profiles[str(p.id)] = {
                "name": p.display_name or "Anonymous User",
                "location": p.location
            }

    top_entries = []
    for rank, (member, score) in enumerate(top_members, 1):
        profile = user_profiles.get(member, {"name": "Anonymous User", "location": "Unknown"})
        top_entries.append({
            "rank": rank,
            "user_id": member,
            "display_name": profile["name"],
            "location": profile["location"],
            "score": int(score)
        })

    # Fetch requesting user rank if they exist on the set
    user_rank = None
    user_score = await redis_client.zscore(redis_key, str(user.id))
    if user_score is not None:
        idx = await redis_client.zrevrank(redis_key, str(user.id))
        user_rank = {
            "rank": idx + 1 if idx is not None else 0,
            "user_id": str(user.id),
            "display_name": user.display_name or "You",
            "location": user.location,
            "score": int(user_score)
        }

    return {
        "top_entries": top_entries,
        "user_rank": user_rank
    }
