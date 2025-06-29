from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.routine import Routine, RoutineExercise
from app.schemas.routine import RoutineCreate, RoutineUpdate, RoutineExerciseCreate


class RoutineService:
    
    @staticmethod
    def create_routine(db: Session, user_id: int, routine_data: RoutineCreate) -> Routine:
        """Create a new routine with exercises"""
        
        # Check if routine name already exists for this user
        existing_routine = db.query(Routine).filter(
            and_(Routine.user_id == user_id, Routine.name == routine_data.name)
        ).first()
        
        if existing_routine:
            raise ValueError(f"Ya existe una rutina con el nombre '{routine_data.name}'")
        
        # Create the routine
        db_routine = Routine(
            user_id=user_id,
            name=routine_data.name,
            description=routine_data.description,
            exercises=routine_data.exercises,
            days=routine_data.days,
            main_lifts=routine_data.main_lifts,
            is_active=routine_data.is_active,
            is_template=routine_data.is_template
        )
        
        db.add(db_routine)
        db.flush()  # Get the ID without committing
        
        # Create routine exercises if provided
        if routine_data.routine_exercises:
            for exercise_data in routine_data.routine_exercises:
                db_exercise = RoutineExercise(
                    routine_id=db_routine.id,
                    exercise_name=exercise_data.exercise_name,
                    order=exercise_data.order,
                    sets=exercise_data.sets,
                    reps=exercise_data.reps,
                    weight_percentage=exercise_data.weight_percentage,
                    rest_time=exercise_data.rest_time,
                    is_main_lift=exercise_data.is_main_lift,
                    notes=exercise_data.notes
                )
                db.add(db_exercise)
        
        db.commit()
        db.refresh(db_routine)
        return db_routine
    
    @staticmethod
    def get_routines(db: Session, user_id: int, include_templates: bool = False) -> List[Routine]:
        """Get all routines for a user"""
        query = db.query(Routine).filter(Routine.user_id == user_id)
        
        if not include_templates:
            query = query.filter(Routine.is_template == False)
        
        return query.order_by(Routine.created_at.desc()).all()
    
    @staticmethod
    def get_routine(db: Session, routine_id: int, user_id: int) -> Optional[Routine]:
        """Get a specific routine"""
        return db.query(Routine).filter(
            and_(Routine.id == routine_id, Routine.user_id == user_id)
        ).first()
    
    @staticmethod
    def get_active_routines(db: Session, user_id: int) -> List[Routine]:
        """Get all active routines for a user"""
        return db.query(Routine).filter(
            and_(Routine.user_id == user_id, Routine.is_active == True)
        ).all()
    
    @staticmethod
    def get_routines_by_day(db: Session, user_id: int, day: int) -> List[Routine]:
        """Get routines for a specific day"""
        return db.query(Routine).filter(
            and_(
                Routine.user_id == user_id,
                Routine.is_active == True,
                Routine.days.contains([day])
            )
        ).all()
    
    @staticmethod
    def update_routine(db: Session, routine_id: int, user_id: int, routine_data: RoutineUpdate) -> Optional[Routine]:
        """Update a routine"""
        db_routine = RoutineService.get_routine(db, routine_id, user_id)
        if not db_routine:
            return None
        
        # Check if new name conflicts with existing routine
        if routine_data.name and routine_data.name != db_routine.name:
            existing_routine = db.query(Routine).filter(
                and_(
                    Routine.user_id == user_id,
                    Routine.name == routine_data.name,
                    Routine.id != routine_id
                )
            ).first()
            
            if existing_routine:
                raise ValueError(f"Ya existe una rutina con el nombre '{routine_data.name}'")
        
        # Update only provided fields
        update_data = routine_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_routine, field, value)
        
        db_routine.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_routine)
        return db_routine
    
    @staticmethod
    def delete_routine(db: Session, routine_id: int, user_id: int) -> bool:
        """Delete a routine"""
        db_routine = RoutineService.get_routine(db, routine_id, user_id)
        if not db_routine:
            return False
        
        db.delete(db_routine)
        db.commit()
        return True
    
    @staticmethod
    def activate_routine(db: Session, routine_id: int, user_id: int) -> Optional[Routine]:
        """Activate a routine (deactivate others)"""
        # Deactivate all other routines for this user
        db.query(Routine).filter(
            and_(Routine.user_id == user_id, Routine.id != routine_id)
        ).update({"is_active": False})
        
        # Activate the specified routine
        db_routine = RoutineService.get_routine(db, routine_id, user_id)
        if not db_routine:
            return None
        
        db_routine.is_active = True
        db_routine.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_routine)
        return db_routine
    
    @staticmethod
    def create_from_template(db: Session, user_id: int, template_id: int, name: str) -> Optional[Routine]:
        """Create a routine from a template"""
        template = db.query(Routine).filter(
            and_(Routine.id == template_id, Routine.is_template == True)
        ).first()
        
        if not template:
            return None
        
        # Create new routine based on template
        routine_data = RoutineCreate(
            name=name,
            description=template.description,
            exercises=template.exercises,
            days=template.days,
            main_lifts=template.main_lifts,
            is_active=False,
            is_template=False
        )
        
        return RoutineService.create_routine(db, user_id, routine_data)
    
    @staticmethod
    def get_routine_summary(db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Get routine summaries for dashboard"""
        routines = RoutineService.get_routines(db, user_id)
        
        summaries = []
        for routine in routines:
            summaries.append({
                "id": routine.id,
                "name": routine.name,
                "description": routine.description,
                "exercise_count": len(routine.exercises),
                "day_count": len(routine.days),
                "is_active": routine.is_active,
                "created_at": routine.created_at
            })
        
        return summaries 