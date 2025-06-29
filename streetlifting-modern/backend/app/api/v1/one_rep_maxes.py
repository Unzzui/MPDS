from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.training import OneRepMax, OneRepMaxCreate, OneRepMaxUpdate
from app.services.training import TrainingService

router = APIRouter()


@router.get("/", response_model=List[OneRepMax])
def get_one_rep_maxes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all OneRepMax records for the current user"""
    one_rep_maxes = TrainingService.get_one_rep_maxes(db, current_user.id)
    return one_rep_maxes


@router.get("/{one_rm_id}", response_model=OneRepMax)
def get_one_rep_max(
    one_rm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific OneRepMax record"""
    one_rep_max = TrainingService.get_one_rep_max(db, one_rm_id, current_user.id)
    if not one_rep_max:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OneRepMax record not found"
        )
    return one_rep_max


@router.post("/", response_model=OneRepMax)
def create_one_rep_max(
    one_rm_data: OneRepMaxCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new OneRepMax record"""
    try:
        one_rep_max = TrainingService.create_one_rep_max(db, current_user.id, one_rm_data)
        return one_rep_max
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating OneRepMax record: {str(e)}"
        )


@router.put("/{one_rm_id}", response_model=OneRepMax)
def update_one_rep_max(
    one_rm_id: int,
    one_rm_data: OneRepMaxUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a OneRepMax record"""
    try:
        one_rep_max = TrainingService.update_one_rep_max(db, one_rm_id, current_user.id, one_rm_data)
        if not one_rep_max:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="OneRepMax record not found"
            )
        return one_rep_max
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{one_rm_id}")
def delete_one_rep_max(
    one_rm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a OneRepMax record"""
    success = TrainingService.delete_one_rep_max(db, one_rm_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OneRepMax record not found"
        )
    return {"message": "OneRepMax record deleted successfully"} 