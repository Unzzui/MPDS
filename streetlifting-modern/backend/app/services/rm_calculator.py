from typing import Dict, List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from app.models.workout import Exercise, Workout
from app.models.training import OneRepMax


def calculate_estimated_one_rm(weight: float, reps: int, rpe: Optional[float] = None) -> float:
    """
    Calculate estimated one-rep max using Epley formula with RPE adjustment
    """
    if reps <= 0 or weight <= 0:
        return 0.0
    
    # Epley formula: 1RM = weight × (1 + reps/30)
    estimated_rm = weight * (1 + reps / 30)
    
    # RPE adjustment (if RPE is provided)
    if rpe is not None and 1 <= rpe <= 10:
        # RPE adjustment factors (approximate)
        rpe_factors = {
            10: 1.0,    # Max effort
            9.5: 0.98,
            9: 0.96,
            8.5: 0.94,
            8: 0.92,
            7.5: 0.90,
            7: 0.88,
            6.5: 0.86,
            6: 0.84,
            5.5: 0.82,
            5: 0.80
        }
        
        # Find closest RPE factor
        closest_rpe = min(rpe_factors.keys(), key=lambda x: abs(x - rpe))
        estimated_rm *= rpe_factors[closest_rpe]
    
    return round(estimated_rm, 2)


def calculate_percentage_of_rm(one_rm: float, percentage: float) -> float:
    """Calculate weight for a given percentage of 1RM"""
    return round(one_rm * (percentage / 100), 2)


def get_suggested_weights(one_rm: float) -> Dict[str, float]:
    """Get suggested weights for different rep ranges"""
    return {
        "3x3": calculate_percentage_of_rm(one_rm, 90),  # 90% of 1RM
        "3x5": calculate_percentage_of_rm(one_rm, 85),  # 85% of 1RM
        "3x8": calculate_percentage_of_rm(one_rm, 75),  # 75% of 1RM
        "5x5": calculate_percentage_of_rm(one_rm, 80),  # 80% of 1RM
        "5x3": calculate_percentage_of_rm(one_rm, 87),  # 87% of 1RM
    }


class RMCalculatorService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_latest_one_rm(self, user_id: int, exercise: str) -> Optional[float]:
        """Get the latest one-rep max for an exercise"""
        latest_rm = self.db.query(OneRepMax).filter(
            and_(OneRepMax.user_id == user_id, OneRepMax.exercise == exercise)
        ).order_by(desc(OneRepMax.date_achieved)).first()
        
        return latest_rm.one_rm if latest_rm else None
    
    def calculate_from_recent_workouts(self, user_id: int, exercise: str, days_back: int = 30) -> Optional[float]:
        """Calculate estimated 1RM from recent workout data"""
        cutoff_date = date.today() - timedelta(days=days_back)
        
        # Get recent exercises for this exercise
        recent_exercises = self.db.query(Exercise).join(Workout).filter(
            and_(
                Workout.user_id == user_id,
                Exercise.name == exercise,
                Workout.date >= cutoff_date,
                Workout.completed == True
            )
        ).order_by(desc(Workout.date)).limit(10).all()
        
        if not recent_exercises:
            return None
        
        # Calculate estimated 1RM for each set and take the highest
        estimated_rms = []
        for exercise_record in recent_exercises:
            if exercise_record.weight > 0 and exercise_record.reps > 0:
                estimated_rm = calculate_estimated_one_rm(
                    exercise_record.weight, 
                    exercise_record.reps, 
                    exercise_record.rpe
                )
                estimated_rms.append(estimated_rm)
        
        return max(estimated_rms) if estimated_rms else None
    
    def update_one_rm(self, user_id: int, exercise: str, one_rm: float) -> OneRepMax:
        """Update or create a one-rep max record"""
        # Check if there's an existing record for today
        today = date.today()
        existing_rm = self.db.query(OneRepMax).filter(
            and_(
                OneRepMax.user_id == user_id,
                OneRepMax.exercise == exercise,
                OneRepMax.date_achieved == today
            )
        ).first()
        
        if existing_rm:
            # Update existing record if new RM is higher
            if one_rm > existing_rm.one_rm:
                existing_rm.one_rm = one_rm
                self.db.commit()
                self.db.refresh(existing_rm)
            return existing_rm
        else:
            # Create new record
            new_rm = OneRepMax(
                user_id=user_id,
                exercise=exercise,
                one_rm=one_rm,
                date_achieved=today
            )
            self.db.add(new_rm)
            self.db.commit()
            self.db.refresh(new_rm)
            return new_rm
    
    def get_progress_data(self, user_id: int, exercise: str, days_back: int = 90) -> List[Dict]:
        """Get progress data for an exercise over time"""
        cutoff_date = date.today() - timedelta(days=days_back)
        
        # Get all 1RM records for this exercise
        rm_records = self.db.query(OneRepMax).filter(
            and_(
                OneRepMax.user_id == user_id,
                OneRepMax.exercise == exercise,
                OneRepMax.date_achieved >= cutoff_date
            )
        ).order_by(OneRepMax.date_achieved).all()
        
        return [
            {
                "date": record.date_achieved.isoformat(),
                "one_rm": record.one_rm
            }
            for record in rm_records
        ]
    
    def get_exercise_history(self, user_id: int, exercise: str, limit: int = 20) -> List[Dict]:
        """Get recent workout history for an exercise"""
        recent_workouts = self.db.query(Exercise).join(Workout).filter(
            and_(
                Workout.user_id == user_id,
                Exercise.name == exercise,
                Workout.completed == True
            )
        ).order_by(desc(Workout.date)).limit(limit).all()
        
        return [
            {
                "date": exercise_record.workout.date.isoformat(),
                "weight": exercise_record.weight,
                "reps": exercise_record.reps,
                "rpe": exercise_record.rpe,
                "estimated_rm": calculate_estimated_one_rm(
                    exercise_record.weight, 
                    exercise_record.reps, 
                    exercise_record.rpe
                )
            }
            for exercise_record in recent_workouts
        ] 