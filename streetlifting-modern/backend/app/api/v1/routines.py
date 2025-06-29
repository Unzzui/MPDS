from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.routine import (
    Routine, RoutineCreate, RoutineUpdate, RoutineSummary, 
    RoutineTemplate, RoutineExercise, RoutineExerciseCreate
)
from app.services.routine import RoutineService

router = APIRouter()


@router.get("/", response_model=List[RoutineSummary])
def get_routines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all routines for the current user"""
    routines = RoutineService.get_routines(db, current_user.id)
    
    # Convert to RoutineSummary objects
    summaries = []
    for routine in routines:
        summaries.append({
            "id": routine.id,
            "name": routine.name,
            "description": routine.description,
            "exercise_count": len(routine.exercises) if routine.exercises else 0,
            "day_count": len(routine.days) if routine.days else 0,
            "is_active": routine.is_active,
            "created_at": routine.created_at
        })
    
    return summaries


@router.get("/templates", response_model=List[RoutineTemplate])
def get_routine_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all routine templates"""
    templates = RoutineService.get_routines(db, current_user.id, include_templates=True)
    return [t for t in templates if t.is_template]


@router.get("/active", response_model=List[Routine])
def get_active_routines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active routines for the current user"""
    routines = RoutineService.get_active_routines(db, current_user.id)
    return routines


@router.get("/day/{day}", response_model=List[Routine])
def get_routines_by_day(
    day: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get routines for a specific day (1-7)"""
    if day < 1 or day > 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Day must be between 1 and 7"
        )
    
    routines = RoutineService.get_routines_by_day(db, current_user.id, day)
    return routines


@router.post("/", response_model=Routine)
def create_routine(
    routine_data: RoutineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new routine"""
    try:
        routine = RoutineService.create_routine(db, current_user.id, routine_data)
        return routine
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating routine: {str(e)}"
        )


@router.get("/{routine_id}", response_model=Routine)
def get_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific routine"""
    routine = RoutineService.get_routine(db, routine_id, current_user.id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    return routine


@router.put("/{routine_id}", response_model=Routine)
def update_routine(
    routine_id: int,
    routine_data: RoutineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a routine"""
    try:
        routine = RoutineService.update_routine(db, routine_id, current_user.id, routine_data)
        if not routine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Routine not found"
            )
        return routine
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{routine_id}")
def delete_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a routine"""
    success = RoutineService.delete_routine(db, routine_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    return {"message": "Routine deleted successfully"}


@router.post("/{routine_id}/activate", response_model=Routine)
def activate_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a routine (deactivate others)"""
    routine = RoutineService.activate_routine(db, routine_id, current_user.id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    return routine


@router.post("/templates/{template_id}/create", response_model=Routine)
def create_from_template(
    template_id: int,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a routine from a template"""
    routine = RoutineService.create_from_template(db, current_user.id, template_id, name)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return routine


@router.get("/{routine_id}/exercises", response_model=List[RoutineExercise])
def get_routine_exercises(
    routine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get exercises for a specific routine"""
    routine = RoutineService.get_routine(db, routine_id, current_user.id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    return routine.routine_exercises


@router.post("/{routine_id}/exercises", response_model=RoutineExercise)
def add_routine_exercise(
    routine_id: int,
    exercise_data: RoutineExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an exercise to a routine"""
    routine = RoutineService.get_routine(db, routine_id, current_user.id)
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    # Create the exercise
    from app.models.routine import RoutineExercise
    db_exercise = RoutineExercise(
        routine_id=routine_id,
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
    db.refresh(db_exercise)
    return db_exercise 