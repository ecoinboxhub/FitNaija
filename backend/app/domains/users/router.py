from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.session import get_db
from backend.app.database.models import User, LOCATION_TAXONOMY
from backend.app.domains.auth.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users Profile"])

class UserProfileResponse(BaseModel):
    id: str
    phone: str
    display_name: str | None
    location: str
    status: str
    trial_end: str
    bank_name: str | None
    bank_account_number: str | None

class UpdateProfileRequest(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=50)
    location: str = Field(..., description="Predefined Abuja neighborhoods, Lagos, or Port Harcourt")
    bank_name: str | None = None
    bank_account_number: str | None = Field(None, min_length=10, max_length=10, description="10-digit NUBAN number")

@router.get("/me", response_model=UserProfileResponse)
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "phone": user.phone,
        "display_name": user.display_name,
        "location": user.location,
        "status": user.status,
        "trial_end": user.trial_end.isoformat(),
        "bank_name": user.bank_name,
        "bank_account_number": user.bank_account_number
    }

@router.post("/profile", status_code=status.HTTP_200_OK)
async def update_profile(
    payload: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    loc_clean = payload.location.strip().lower()
    if loc_clean not in LOCATION_TAXONOMY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid location. Allowed values are: {', '.join(LOCATION_TAXONOMY)}"
        )

    user.display_name = payload.display_name
    user.location = loc_clean
    user.bank_name = payload.bank_name
    user.bank_account_number = payload.bank_account_number

    await db.commit()
    return {"status": "updated"}
