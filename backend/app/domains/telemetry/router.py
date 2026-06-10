import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database.session import get_db
from backend.app.database.models import ActivityLog, ChallengeParticipant, Challenge, User
from backend.app.domains.auth.deps import get_active_user
from backend.app.core.security import redis_client
from backend.app.core.ai_router import verify_screenshot_proof

router = APIRouter(prefix="/activity", tags=["Telemetry Sync"])

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_activity(
    challenge_id: str = Form(...),
    steps: int = Form(...),
    distance_m: float = Form(0.0),
    duration_sec: int = Form(0),
    proof_image: UploadFile = File(None),
    user: User = Depends(get_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Sync manual log telemetry. Evaluates entries via the rules engine and optional Gemini Vision audits."""
    ch_uuid = uuid.UUID(challenge_id)
    
    # 1. Rate Limit Checks (max 5 syncs per 10 minutes)
    ratelimit_key = f"sync_limit:{user.id}"
    request_count = await redis_client.incr(ratelimit_key)
    if request_count == 1:
        await redis_client.expire(ratelimit_key, 600)
    if request_count > 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 5 syncs per 10 minutes allowed."
        )

    # 2. Check Challenge context
    ch_query = select(Challenge).filter(Challenge.id == ch_uuid)
    challenge = (await db.execute(ch_query)).scalars().first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge context not found")
    if challenge.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Challenge is not currently active")

    # Verify user is joined
    part_query = select(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == ch_uuid,
        ChallengeParticipant.user_id == user.id
    )
    participant = (await db.execute(part_query)).scalars().first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not registered in this challenge"
        )

    fraud_flags = {}
    is_verified = True
    fraud_score = 0.0

    # 3. Rules Engine Telemetry Validation
    # Rule 1: Step Ceiling
    if steps > 50000:
        fraud_flags["max_steps_exceeded"] = "Logged over 50,000 steps in a single sync"
        is_verified = False
        fraud_score = 1.0

    # Rule 2: Pace Speed Check (Motoring ceiling)
    if distance_m > 0 and duration_sec > 0:
        speed_kmh = (distance_m / 1000.0) / (duration_sec / 3600.0)
        if speed_kmh > 40.0:
            fraud_flags["motoring_ceiling_exceeded"] = f"Calculated speed was {speed_kmh:.2f} km/h (motoring limit is 40 km/h)"
            is_verified = False
            fraud_score = 1.0

    # 4. Optional Image Screenshot Verification (Google Gemini OCR validation)
    image_url = None
    if proof_image and is_verified:
        try:
            image_bytes = await proof_image.read()
            ocr_res = await verify_screenshot_proof(image_bytes, proof_image.content_type)
            
            # Simple OCR comparison
            ocr_steps = ocr_res.get("steps")
            if ocr_steps is not None:
                diff = abs(steps - ocr_steps)
                # If difference exceeds 10%, raise mismatch flag
                if diff > (steps * 0.1):
                    fraud_flags["ocr_mismatch"] = f"User logged {steps} steps but screenshot indicates {ocr_steps} steps."
                    is_verified = False
                    fraud_score = 0.9
            
            # Save visual reference URL (local mock URL)
            image_url = f"https://fitnaija-proofs.s3.amazonaws.com/{user.id}/{uuid.uuid4()}.jpg"
        except Exception as e:
            fraud_flags["image_ocr_failure"] = f"OCR audit failed: {str(e)}"
            is_verified = False
            fraud_score = 0.5

    # 5. Ingestion persistence & Leaderboard routing
    log = ActivityLog(
        user_id=user.id,
        challenge_id=ch_uuid,
        steps=steps,
        distance_m=Decimal(str(distance_m)),
        duration_sec=duration_sec,
        proof_image_url=image_url,
        is_verified=is_verified,
        fraud_score=Decimal(str(fraud_score)),
        fraud_flags=fraud_flags
    )
    db.add(log)

    if not is_verified:
        # Quarantine user leaderboard progress
        participant.fraud_status = "hard_flag"
        await db.commit()
        return {
            "status": "flagged",
            "message": "Workout logged but flagged for review. Progress frozen on leaderboards.",
            "flags": fraud_flags
        }

    # If clean, credit steps
    participant.total_steps += steps
    await db.commit()

    # Sync to Redis Sorted Set
    redis_key = f"leaderboard:{challenge_id}"
    await redis_client.zincrby(redis_key, steps, str(user.id))

    return {
        "status": "verified",
        "message": f"Successfully verified and credited {steps} steps!",
        "total_credited": participant.total_steps
    }
