from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
import json
from datetime import date, datetime, timedelta

from app.models.training import TrainingBlock, BlockStage
from app.schemas.training_block import TrainingBlockCreate, TrainingBlockUpdate, BlockProgress


class TrainingBlockService:
    
    @staticmethod
    def create_training_block(db: Session, user_id: int, block_data: TrainingBlockCreate) -> TrainingBlock:
        """Create a new training block with stages"""
        
        # Create the training block
        db_block = TrainingBlock(
            user_id=user_id,
            name=block_data.name,
            duration=block_data.duration,
            total_weeks=block_data.total_weeks,
            current_stage=block_data.current_stage,
            start_date=block_data.start_date,
            end_date=block_data.end_date,
            current_week=block_data.current_week,
            rm_pullups=block_data.rm_pullups,
            rm_dips=block_data.rm_dips,
            rm_muscleups=block_data.rm_muscleups,
            rm_squats=block_data.rm_squats,
            strategy=block_data.strategy,
            weekly_increment=block_data.weekly_increment,
            deload_week=block_data.deload_week,
            routines_by_day=block_data.routines_by_day,
            increment_type=block_data.increment_type,
            status='planned'
        )
        
        db.add(db_block)
        db.flush()  # Get the ID without committing
        
        # Create stages
        for stage_data in block_data.stages:
            db_stage = BlockStage(
                block_id=db_block.id,
                name=stage_data.name,
                week_number=stage_data.week_number,
                load_percentage=stage_data.load_percentage,
                description=stage_data.description
            )
            db.add(db_stage)
        
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def get_training_blocks(db: Session, user_id: int) -> List[TrainingBlock]:
        """Get all training blocks for a user"""
        return db.query(TrainingBlock).filter(TrainingBlock.user_id == user_id).all()
    
    @staticmethod
    def get_training_block(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Get a specific training block"""
        return db.query(TrainingBlock).filter(
            and_(TrainingBlock.id == block_id, TrainingBlock.user_id == user_id)
        ).first()
    
    @staticmethod
    def get_current_active_block(db: Session, user_id: int) -> Optional[TrainingBlock]:
        """Get the currently active training block for a user"""
        return db.query(TrainingBlock).filter(
            and_(TrainingBlock.user_id == user_id, TrainingBlock.is_active == True)
        ).first()
    
    @staticmethod
    def update_training_block(db: Session, block_id: int, user_id: int, block_data: TrainingBlockUpdate) -> Optional[TrainingBlock]:
        """Update a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        # Update only provided fields
        update_data = block_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_block, field, value)
        
        db_block.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def delete_training_block(db: Session, block_id: int, user_id: int) -> bool:
        """Delete a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return False
        
        db.delete(db_block)
        db.commit()
        return True
    
    @staticmethod
    def activate_training_block(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Activate a training block (deactivate others)"""
        # Deactivate all other blocks for this user
        db.query(TrainingBlock).filter(
            and_(TrainingBlock.user_id == user_id, TrainingBlock.id != block_id)
        ).update({"is_active": False})
        
        # Activate the specified block
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        db_block.is_active = True
        db_block.status = 'in_progress'
        db_block.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def get_block_progress(db: Session, block_id: int, user_id: int) -> Optional[BlockProgress]:
        """Get progress information for a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        # Calculate progress percentage
        progress_percentage = (db_block.current_week / db_block.total_weeks) * 100
        
        # Generate weekly projections
        weekly_projections = TrainingBlockService._generate_weekly_projections(db_block)
        
        # Generate RPE tables
        rpe_tables = TrainingBlockService._generate_rpe_tables(db_block)
        
        return BlockProgress(
            current_week=db_block.current_week,
            total_weeks=db_block.total_weeks,
            progress_percentage=progress_percentage,
            next_workout=None,  # TODO: Calculate based on routines_by_day
            weekly_projections=weekly_projections,
            rpe_tables=rpe_tables
        )
    
    @staticmethod
    def _generate_weekly_projections(block: TrainingBlock) -> Dict[str, Dict[str, float]]:
        """Generate weekly weight projections for the block"""
        projections = {}
        
        exercises = {
            'pullups': block.rm_pullups,
            'dips': block.rm_dips,
            'muscleups': block.rm_muscleups,
            'squats': block.rm_squats
        }
        
        for week in range(1, block.total_weeks + 1):
            week_key = f"week_{week}"
            projections[week_key] = {}
            
            for exercise, base_rm in exercises.items():
                if base_rm > 0:
                    # Calculate projected weight based on increment type and strategy
                    if block.increment_type == 'percentage':
                        increment = base_rm * (block.weekly_increment / 100)
                    else:
                        increment = block.weekly_increment
                    
                    projected_weight = base_rm + (increment * (week - 1))
                    projections[week_key][exercise] = round(projected_weight, 1)
                else:
                    projections[week_key][exercise] = 0.0
        
        return projections
    
    @staticmethod
    def _generate_rpe_tables(block: TrainingBlock) -> Dict[str, Dict[str, List[float]]]:
        """Generate RPE tables for different exercises"""
        rpe_tables = {}
        
        exercises = {
            'pullups': block.rm_pullups,
            'dips': block.rm_dips,
            'muscleups': block.rm_muscleups,
            'squats': block.rm_squats
        }
        
        for exercise, base_rm in exercises.items():
            if base_rm > 0:
                rpe_tables[exercise] = {}
                
                # Generate RPE values for different rep ranges
                for rpe in range(6, 11):  # RPE 6-10
                    rpe_key = f"RPE_{rpe}"
                    rpe_tables[exercise][rpe_key] = []
                    
                    # Calculate weights for different rep ranges
                    for reps in [1, 3, 5, 8, 10]:
                        # Simple RPE calculation (can be improved)
                        if rpe == 10:
                            weight = base_rm
                        else:
                            weight = base_rm * (0.85 + (rpe - 6) * 0.03)
                        
                        rpe_tables[exercise][rpe_key].append(round(weight, 1))
        
        return rpe_tables
    
    @staticmethod
    def advance_week(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Advance the training block to the next week"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        if db_block.current_week < db_block.total_weeks:
            db_block.current_week += 1
            
            # Check if block is completed
            if db_block.current_week >= db_block.total_weeks:
                db_block.status = 'completed'
                db_block.is_active = False
            
            db_block.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_block)
        
        return db_block 