from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.workout import WorkoutService
from app.schemas.workout import (
    Workout, WorkoutCreate, WorkoutUpdate, WorkoutSummary, 
    WorkoutProgress, ExerciseCreate
)

router = APIRouter()


@router.post("/", response_model=Workout)
def create_workout(
    workout: WorkoutCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new workout"""
    workout_service = WorkoutService(db)
    return workout_service.create_workout(workout, current_user.id)


@router.get("/", response_model=List[WorkoutSummary])
def get_workouts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    day_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's workouts with optional filters"""
    workout_service = WorkoutService(db)
    workouts = workout_service.get_user_workouts(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        day_type=day_type
    )
    
    # Convert to summary format
    summaries = []
    for workout in workouts:
        exercise_count = len(workout.exercises)
        total_sets = sum(len([ex for ex in workout.exercises if ex.completed]) for _ in [workout])
        
        summaries.append(WorkoutSummary(
            id=workout.id,
            date=workout.date,
            day_type=workout.day_type,
            success=workout.success,
            completed=workout.completed,
            exercise_count=exercise_count,
            total_sets=total_sets
        ))
    
    return summaries


@router.get("/{workout_id}", response_model=Workout)
def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout"""
    workout_service = WorkoutService(db)
    workout = workout_service.get_workout(workout_id, current_user.id)
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.put("/{workout_id}", response_model=Workout)
def update_workout(
    workout_id: int,
    workout_update: WorkoutUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a workout"""
    workout_service = WorkoutService(db)
    workout = workout_service.update_workout(workout_id, current_user.id, workout_update)
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a workout"""
    workout_service = WorkoutService(db)
    success = workout_service.delete_workout(workout_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return {"message": "Workout deleted successfully"}


@router.get("/pending/list", response_model=List[Workout])
def get_pending_workouts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workouts that are in progress"""
    workout_service = WorkoutService(db)
    return workout_service.get_pending_workouts(current_user.id)


@router.post("/progress/save", response_model=Workout)
def save_workout_progress(
    progress: WorkoutProgress,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save workout progress (for in-progress workouts)"""
    workout_service = WorkoutService(db)
    try:
        return workout_service.save_workout_progress(progress, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{workout_id}/complete", response_model=Workout)
def complete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a workout as completed"""
    workout_service = WorkoutService(db)
    workout = workout_service.complete_workout(workout_id, current_user.id)
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.get("/stats/summary")
def get_workout_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workout statistics"""
    workout_service = WorkoutService(db)
    return workout_service.get_workout_stats(
        current_user.id, 
        start_date=start_date, 
        end_date=end_date
    ) 