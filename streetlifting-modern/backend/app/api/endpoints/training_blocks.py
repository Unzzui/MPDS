from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.training_block import TrainingBlockService
from app.services.training_calculator import TrainingCalculatorService
from app.schemas.training_block import (
    TrainingBlock, TrainingBlockCreate, TrainingBlockUpdate, 
    BlockProgress, BlockStage
)

router = APIRouter()

@router.get("/", response_model=List[TrainingBlock])
def get_training_blocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all training blocks for the current user"""
    return TrainingBlockService.get_training_blocks(db, current_user.id)

@router.post("/", response_model=TrainingBlock)
def create_training_block(
    block_data: TrainingBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new training block"""
    return TrainingBlockService.create_training_block(db, current_user.id, block_data)

@router.get("/{block_id}", response_model=TrainingBlock)
def get_training_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific training block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(status_code=404, detail="Training block not found")
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
        raise HTTPException(status_code=404, detail="Training block not found")
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
        raise HTTPException(status_code=404, detail="Training block not found")
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
        raise HTTPException(status_code=404, detail="Training block not found")
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
        raise HTTPException(status_code=404, detail="Training block not found")
    return progress

@router.get("/{block_id}/projections")
def get_training_projections(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed training projections for a block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(status_code=404, detail="Training block not found")
    
    # Get strategy parameters
    strategy_params = {
        'duration': block.duration,
        'weekly_increment': block.weekly_increment,
        'increment_type': block.increment_type,
        'deload_week': block.deload_week,
        'volume_multiplier': block.volume_multiplier,
        'intensity_focus': block.intensity_focus,
        'daily_variation': block.daily_variation,
        'intensity_range': block.intensity_range,
        'volume_cycles': block.volume_cycles,
        'max_effort_days': block.max_effort_days,
        'dynamic_effort_days': block.dynamic_effort_days,
        'repetition_effort_days': block.repetition_effort_days,
        'wave_pattern': block.wave_pattern,
        'wave_amplitude': block.wave_amplitude,
        'wave_frequency': block.wave_frequency
    }
    
    exercises = {
        'pullups': block.rm_pullups,
        'dips': block.rm_dips,
        'muscleups': block.rm_muscleups,
        'squats': block.rm_squats
    }
    
    projections = {}
    
    for week in range(1, block.total_weeks + 1):
        week_key = f"week_{week}"
        projections[week_key] = {}
        
        for exercise, one_rm in exercises.items():
            if one_rm > 0:
                # Calculate detailed progression
                progression = TrainingCalculatorService.calculate_weekly_progression(
                    one_rm, block.strategy, week, strategy_params
                )
                
                projections[week_key][exercise] = {
                    'one_rm': one_rm,
                    'load_percentage': progression['load_percentage'],
                    'working_weight': progression['working_weight'],
                    'reps_range': progression['reps_range'],
                    'sets': progression['sets'],
                    'rpe': progression['rpe'],
                    'notes': progression['notes']
                }
            else:
                projections[week_key][exercise] = {
                    'one_rm': 0,
                    'load_percentage': 0,
                    'working_weight': 0,
                    'reps_range': [0, 0],
                    'sets': 0,
                    'rpe': 0,
                    'notes': 'No 1RM establecido'
                }
    
    return {
        'block_id': block.id,
        'strategy': block.strategy,
        'duration': block.duration,
        'projections': projections
    }

@router.get("/{block_id}/rpe-tables")
def get_rpe_tables(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get RPE tables for a training block"""
    block = TrainingBlockService.get_training_block(db, block_id, current_user.id)
    if not block:
        raise HTTPException(status_code=404, detail="Training block not found")
    
    exercises = {
        'pullups': block.rm_pullups,
        'dips': block.rm_dips,
        'muscleups': block.rm_muscleups,
        'squats': block.rm_squats
    }
    
    rpe_tables = {}
    
    for exercise, one_rm in exercises.items():
        if one_rm > 0:
            rpe_tables[exercise] = TrainingCalculatorService.get_rpe_table(one_rm)
        else:
            rpe_tables[exercise] = {}
    
    return {
        'block_id': block.id,
        'rpe_tables': rpe_tables
    } 