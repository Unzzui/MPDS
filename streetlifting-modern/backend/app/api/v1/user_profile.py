from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_profile import UserProfileService
from app.api.deps import get_current_user
from app.models.user import User
from typing import Dict, Any

router = APIRouter()

@router.get("/setup-status")
async def get_setup_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user setup status"""
    return UserProfileService.get_setup_status(db, current_user.id)

@router.post("/complete-setup")
async def complete_setup(
    setup_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete user setup"""
    try:
        profile = UserProfileService.complete_setup(db, current_user.id, setup_data)
        return {
            "message": "Setup completed successfully",
            "profile": profile.to_dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing setup: {str(e)}"
        )

@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    profile = UserProfileService.get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile.to_dict()

@router.put("/profile")
async def update_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    profile = UserProfileService.update_user_profile(db, current_user.id, profile_data)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return {
        "message": "Profile updated successfully",
        "profile": profile.to_dict()
    } 