from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.training_block import (
    TrainingBlock, TrainingBlockCreate, TrainingBlockUpdate, 
    BlockProgress, WeeklyProjection, RpeTable
)
from app.services.training_block import TrainingBlockService

router = APIRouter()


@router.get("/", response_model=List[TrainingBlock])
def get_training_blocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all training blocks for the current user"""
    blocks = TrainingBlockService.get_training_blocks(db, current_user.id)
    return blocks


@router.get("/current/", response_model=TrainingBlock)
def get_current_active_block(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the currently active training block"""
    block = TrainingBlockService.get_current_active_block(db, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active training block found"
        )
    return block


@router.post("/", response_model=TrainingBlock)
def create_training_block(
    block_data: TrainingBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new training block"""
    try:
        block = TrainingBlockService.create_training_block(db, current_user.id, block_data)
        return block
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating training block: {str(e)}"
        )


@router.get("/{block_id}", response_model=TrainingBlock)
def get_training_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific training block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    return block


@router.put("/{block_id}", response_model=TrainingBlock)
def update_training_block(
    block_id: int,
    block_data: TrainingBlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a training block"""
    block = TrainingBlockService.update_training_block(db, block_id, current_user.id, block_data)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    return block


@router.delete("/{block_id}")
def delete_training_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a training block"""
    success = TrainingBlockService.delete_training_block(db, block_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    return {"message": "Training block deleted successfully"}


@router.post("/{block_id}/activate", response_model=TrainingBlock)
def activate_training_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a training block"""
    block = TrainingBlockService.activate_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    return block


@router.get("/{block_id}/progress", response_model=BlockProgress)
def get_block_progress(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress information for a training block"""
    progress = TrainingBlockService.get_block_progress(db, block_id, current_user.id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    return progress


@router.get("/{block_id}/projections")
def get_weekly_projections(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get weekly projections for a training block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    
    projections = TrainingBlockService._generate_weekly_projections(block)
    return projections


@router.get("/{block_id}/rpe-tables")
def get_rpe_tables(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get RPE tables for a training block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    
    rpe_tables = TrainingBlockService._generate_rpe_tables(block)
    return rpe_tables


@router.post("/{block_id}/advance-week", response_model=TrainingBlock)
def advance_week(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Advance the training block to the next week"""
    block = TrainingBlockService.advance_week(db, block_id, current_user.id)
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found or already completed"
        )
    return block 