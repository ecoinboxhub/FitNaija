import random
from datetime import datetime, timedelta
from typing import Optional
import jwt
from redis.asyncio import Redis
from backend.app.core.config import settings

# Setup Redis async connection pool
redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate short-lived access JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate long-lived refresh JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh", "jti": str(random.randint(10000000, 99999999))})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

async def generate_otp(phone: str) -> str:
    """Generate a 6-digit OTP and cache it in Redis with 10-minute expiry."""
    otp = f"{random.randint(100000, 999999)}"
    # Store in Redis with TTL 600s
    await redis_client.set(f"otp:{phone}", otp, ex=600)
    return otp

async def verify_otp(phone: str, otp: str) -> bool:
    """Verify submitted OTP and delete it from Redis if matches."""
    cached_otp = await redis_client.get(f"otp:{phone}")
    if cached_otp and cached_otp == otp:
        await redis_client.delete(f"otp:{phone}")
        return True
    return False

async def blacklist_refresh_token(jti: str, expires_in_seconds: int):
    """Mark a refresh token as revoked/used."""
    await redis_client.set(f"blacklist:{jti}", "true", ex=expires_in_seconds)

async def is_refresh_token_blacklisted(jti: str) -> bool:
    """Check if a refresh token has been blacklisted."""
    val = await redis_client.get(f"blacklist:{jti}")
    return val is not None
