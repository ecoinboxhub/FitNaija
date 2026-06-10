from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database.session import get_db
from backend.app.database.models import User
from backend.app.core.security import decode_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to retrieve the currently logged in user from JWT."""
    token = credentials.credentials
    claims = decode_token(token)
    if not claims or claims.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = claims.get("sub")
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_active_user(user: User = Depends(get_current_user)) -> User:
    """Dependency to check if user has active trial or active subscription."""
    if user.status in ("trial_expired", "subscription_expired"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Payment Required - Your trial or subscription has expired. Please subscribe to continue."
        )
    return user
