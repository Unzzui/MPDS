from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.training import OneRepMax
from app.schemas.training import OneRepMaxCreate, OneRepMaxUpdate


class TrainingService:
    
    @staticmethod
    def get_one_rep_maxes(db: Session, user_id: int) -> List[OneRepMax]:
        """Get all OneRepMax records for a user"""
        return db.query(OneRepMax).filter(OneRepMax.user_id == user_id).order_by(OneRepMax.date_achieved.desc()).all()
    
    @staticmethod
    def get_one_rep_max(db: Session, one_rm_id: int, user_id: int) -> Optional[OneRepMax]:
        """Get a specific OneRepMax record"""
        return db.query(OneRepMax).filter(
            and_(OneRepMax.id == one_rm_id, OneRepMax.user_id == user_id)
        ).first()
    
    @staticmethod
    def create_one_rep_max(db: Session, user_id: int, one_rm_data: OneRepMaxCreate) -> OneRepMax:
        """Create a new OneRepMax record"""
        db_one_rm = OneRepMax(
            user_id=user_id,
            exercise=one_rm_data.exercise,
            one_rm=one_rm_data.one_rm,
            date_achieved=one_rm_data.date_achieved
        )
        
        db.add(db_one_rm)
        db.commit()
        db.refresh(db_one_rm)
        return db_one_rm
    
    @staticmethod
    def update_one_rep_max(db: Session, one_rm_id: int, user_id: int, one_rm_data: OneRepMaxUpdate) -> Optional[OneRepMax]:
        """Update a OneRepMax record"""
        db_one_rm = TrainingService.get_one_rep_max(db, one_rm_id, user_id)
        if not db_one_rm:
            return None
        
        # Update only provided fields
        update_data = one_rm_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_one_rm, field, value)
        
        db_one_rm.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_one_rm)
        return db_one_rm
    
    @staticmethod
    def delete_one_rep_max(db: Session, one_rm_id: int, user_id: int) -> bool:
        """Delete a OneRepMax record"""
        db_one_rm = TrainingService.get_one_rep_max(db, one_rm_id, user_id)
        if not db_one_rm:
            return False
        
        db.delete(db_one_rm)
        db.commit()
        return True
    
    @staticmethod
    def get_latest_one_rep_maxes(db: Session, user_id: int) -> List[OneRepMax]:
        """Get the latest OneRepMax for each exercise"""
        # This is a simplified version - in production you might want to use window functions
        all_records = TrainingService.get_one_rep_maxes(db, user_id)
        latest_by_exercise: Dict[str, OneRepMax] = {}
        
        for record in all_records:
            if (record.exercise not in latest_by_exercise or 
                record.date_achieved > latest_by_exercise[record.exercise].date_achieved):
                latest_by_exercise[record.exercise] = record
        
        return list(latest_by_exercise.values())
    
    @staticmethod
    def get_suggested_weights(db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Get suggested weights based on current OneRepMax records"""
        latest_records = TrainingService.get_latest_one_rep_maxes(db, user_id)
        suggested_weights = []
        
        for record in latest_records:
            suggested_weights.append({
                "exercise": record.exercise,
                "weights_3x3": round(record.one_rm * 0.85, 1),
                "weights_3x5": round(record.one_rm * 0.80, 1),
                "weights_3x8": round(record.one_rm * 0.75, 1)
            })
        
        return suggested_weights 