import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.database.models import User
from backend.app.domains.auth.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])
logger = logging.getLogger("fitnaija.notifications")

class RegisterTokenRequest(BaseModel):
    fcm_token: str

@router.post("/register-token")
async def register_fcm_token(
    payload: RegisterTokenRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user.fcm_token = payload.fcm_token
    await db.commit()
    return {"success": True, "message": "FCM token registered"}
