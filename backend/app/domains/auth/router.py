import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

from backend.app.database.session import get_db
from backend.app.database.models import User
from backend.app.core.config import settings
from backend.app.core.security import (
    generate_otp, verify_otp, create_access_token, create_refresh_token, 
    decode_token, blacklist_refresh_token, is_refresh_token_blacklisted
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger("fitnaija.auth")

class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="Valid Nigerian phone number starting with +234 or local format")

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    status: str

async def send_sms_via_termii(phone: str, otp: str):
    """Deliver SMS OTP using Termii or log OTP for development fallback."""
    sms_text = f"Your FitNaija OTP is: {otp}. Valid for 10 minutes."
    if not settings.TERMII_API_KEY or settings.TERMII_API_KEY == "your_termii_api_key_here":
        print("\n" + "="*50)
        print(f"DEVELOPMENT SMS FALLBACK - TO: {phone}")
        print(f"CONTENT: {sms_text}")
        print("="*50 + "\n")
        return True

    url = "https://api.ng.termii.com/api/sms/send"
    payload = {
        "to": phone,
        "from": "FitNaija",
        "sms": sms_text,
        "type": "plain",
        "channel": "generic",
        "api_key": settings.TERMII_API_KEY
    }
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=payload, timeout=5.0)
            if res.status_code == 200:
                logger.info(f"Termii OTP sent to {phone}")
                return True
            else:
                logger.error(f"Termii error status {res.status_code}: {res.text}")
    except Exception as e:
        logger.error(f"Failed to connect to Termii: {str(e)}")
    return False

@router.post("/otp/send", status_code=status.HTTP_200_OK)
async def send_otp(payload: SendOtpRequest):
    phone_clean = payload.phone.strip()
    # Normalize phone: convert 080... to +23480...
    if phone_clean.startswith("0") and len(phone_clean) == 11:
        phone_clean = "+234" + phone_clean[1:]
    
    otp = await generate_otp(phone_clean)
    delivered = await send_sms_via_termii(phone_clean, otp)
    
    if not delivered:
        # If Termii failed, fallback print and notify client (in dev we want to proceed)
        if settings.TARGET_ENV == "development":
            return {"message": "OTP fallback generated in console"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP SMS"
        )
    return {"message": "OTP sent successfully"}

@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp_endpoint(payload: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    phone_clean = payload.phone.strip()
    if phone_clean.startswith("0") and len(phone_clean) == 11:
        phone_clean = "+234" + phone_clean[1:]

    valid = await verify_otp(phone_clean, payload.otp)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )

    # Check if user exists, otherwise create new user in trial_active status
    result = await db.execute(select(User).filter(User.phone == phone_clean))
    user = result.scalars().first()

    if not user:
        # Onboarding Milestone 1: Create user with default location empty/placeholder
        # User will update location and name on Milestone 2 onboarding
        user = User(
            phone=phone_clean,
            location="wuse", # Default temporary placeholder
            status="trial_active",
            trial_start=datetime.utcnow(),
            trial_end=datetime.utcnow() + timedelta(days=30)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Generate JWT tokens
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "status": user.status
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    token = payload.refresh_token
    claims = decode_token(token)
    
    if not claims or claims.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    jti = claims.get("jti")
    if not jti or await is_refresh_token_blacklisted(jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been blacklisted or reused")

    # Blacklist the old refresh token (RTR pattern)
    exp = claims.get("exp")
    expires_in_seconds = max(1, int(exp - datetime.utcnow().timestamp()))
    await blacklist_refresh_token(jti, expires_in_seconds)

    user_id = claims.get("sub")
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_data = {"sub": str(user.id)}
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "status": user.status
    }
