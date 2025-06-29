from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.workout import Workout, Exercise
from app.models.user import User
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, ExerciseCreate, WorkoutProgress
from app.services.rm_calculator import calculate_estimated_one_rm


class WorkoutService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_workout(self, workout_data: WorkoutCreate, user_id: int) -> Workout:
        """Create a new workout with exercises"""
        db_workout = Workout(
            user_id=user_id,
            date=workout_data.date,
            day_type=workout_data.day_type,
            notes=workout_data.notes,
            in_progress=True,
            completed=False
        )
        self.db.add(db_workout)
        self.db.commit()
        self.db.refresh(db_workout)
        
        # Add exercises
        for i, exercise_data in enumerate(workout_data.exercises, 1):
            db_exercise = Exercise(
                workout_id=db_workout.id,
                name=exercise_data.name,
                weight=exercise_data.weight,
                reps=exercise_data.reps,
                rpe=exercise_data.rpe,
                notes=exercise_data.notes,
                completed=exercise_data.completed,
                set_number=i
            )
            self.db.add(db_exercise)
        
        self.db.commit()
        self.db.refresh(db_workout)
        return db_workout
    
    def get_workout(self, workout_id: int, user_id: int) -> Optional[Workout]:
        """Get a specific workout by ID"""
        return self.db.query(Workout).filter(
            and_(Workout.id == workout_id, Workout.user_id == user_id)
        ).first()
    
    def get_user_workouts(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        day_type: Optional[str] = None
    ) -> List[Workout]:
        """Get workouts for a user with optional filters"""
        query = self.db.query(Workout).filter(Workout.user_id == user_id)
        
        if start_date:
            query = query.filter(Workout.date >= start_date)
        if end_date:
            query = query.filter(Workout.date <= end_date)
        if day_type:
            query = query.filter(Workout.day_type == day_type)
        
        return query.order_by(desc(Workout.date)).offset(skip).limit(limit).all()
    
    def update_workout(self, workout_id: int, user_id: int, workout_data: WorkoutUpdate) -> Optional[Workout]:
        """Update a workout"""
        db_workout = self.get_workout(workout_id, user_id)
        if not db_workout:
            return None
        
        update_data = workout_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_workout, field, value)
        
        db_workout.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_workout)
        return db_workout
    
    def delete_workout(self, workout_id: int, user_id: int) -> bool:
        """Delete a workout"""
        db_workout = self.get_workout(workout_id, user_id)
        if not db_workout:
            return False
        
        self.db.delete(db_workout)
        self.db.commit()
        return True
    
    def get_pending_workouts(self, user_id: int) -> List[Workout]:
        """Get workouts that are in progress"""
        return self.db.query(Workout).filter(
            and_(Workout.user_id == user_id, Workout.in_progress == True)
        ).order_by(desc(Workout.date)).all()
    
    def save_workout_progress(self, progress_data: WorkoutProgress, user_id: int) -> Workout:
        """Save or update workout progress"""
        if progress_data.workout_id:
            # Update existing workout
            db_workout = self.get_workout(progress_data.workout_id, user_id)
            if not db_workout:
                raise ValueError("Workout not found")
        else:
            # Create new workout
            db_workout = Workout(
                user_id=user_id,
                date=progress_data.date,
                day_type=progress_data.day_type,
                in_progress=progress_data.in_progress,
                completed=progress_data.completed
            )
            self.db.add(db_workout)
            self.db.commit()
            self.db.refresh(db_workout)
        
        # Clear existing exercises and add new ones
        self.db.query(Exercise).filter(Exercise.workout_id == db_workout.id).delete()
        
        for i, exercise_data in enumerate(progress_data.exercises, 1):
            db_exercise = Exercise(
                workout_id=db_workout.id,
                name=exercise_data.name,
                weight=exercise_data.weight,
                reps=exercise_data.reps,
                rpe=exercise_data.rpe,
                notes=exercise_data.notes,
                completed=exercise_data.completed,
                set_number=i
            )
            self.db.add(db_exercise)
        
        self.db.commit()
        self.db.refresh(db_workout)
        return db_workout
    
    def complete_workout(self, workout_id: int, user_id: int) -> Optional[Workout]:
        """Mark a workout as completed"""
        db_workout = self.get_workout(workout_id, user_id)
        if not db_workout:
            return None
        
        db_workout.completed = True
        db_workout.in_progress = False
        db_workout.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_workout)
        return db_workout
    
    def get_workout_stats(self, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> dict:
        """Get workout statistics for a user"""
        query = self.db.query(Workout).filter(Workout.user_id == user_id)
        
        if start_date:
            query = query.filter(Workout.date >= start_date)
        if end_date:
            query = query.filter(Workout.date <= end_date)
        
        total_workouts = query.count()
        completed_workouts = query.filter(Workout.completed == True).count()
        
        # Get exercise statistics
        exercise_stats = self.db.query(
            Exercise.name,
            self.db.func.avg(Exercise.weight).label('avg_weight'),
            self.db.func.max(Exercise.weight).label('max_weight'),
            self.db.func.avg(Exercise.reps).label('avg_reps'),
            self.db.func.count(Exercise.id).label('total_sets')
        ).join(Workout).filter(
            and_(Workout.user_id == user_id, Workout.completed == True)
        ).group_by(Exercise.name).all()
        
        return {
            "total_workouts": total_workouts,
            "completed_workouts": completed_workouts,
            "completion_rate": (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0,
            "exercise_stats": [
                {
                    "name": stat.name,
                    "avg_weight": float(stat.avg_weight) if stat.avg_weight else 0,
                    "max_weight": float(stat.max_weight) if stat.max_weight else 0,
                    "avg_reps": float(stat.avg_reps) if stat.avg_reps else 0,
                    "total_sets": stat.total_sets
                }
                for stat in exercise_stats
            ]
        } 