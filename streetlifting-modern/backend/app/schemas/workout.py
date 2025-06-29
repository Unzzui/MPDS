from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class ExerciseBase(BaseModel):
    name: str
    weight: float = Field(..., gt=0)
    reps: int = Field(..., gt=0)
    rpe: Optional[float] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    completed: bool = True
    set_number: int = Field(1, gt=0)


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[float] = Field(None, gt=0)
    reps: Optional[int] = Field(None, gt=0)
    rpe: Optional[float] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    completed: Optional[bool] = None
    set_number: Optional[int] = Field(None, gt=0)


class Exercise(ExerciseBase):
    id: int
    workout_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    date: date
    day_type: str
    notes: Optional[str] = None


class WorkoutCreate(WorkoutBase):
    exercises: List[ExerciseCreate] = []


class WorkoutUpdate(BaseModel):
    date: Optional[date] = None
    day_type: Optional[str] = None
    success: Optional[bool] = None
    in_progress: Optional[bool] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None


class Workout(WorkoutBase):
    id: int
    user_id: int
    success: bool
    in_progress: bool
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    exercises: List[Exercise] = []
    
    class Config:
        from_attributes = True


class WorkoutSummary(BaseModel):
    id: int
    date: date
    day_type: str
    success: bool
    completed: bool
    exercise_count: int
    total_sets: int
    
    class Config:
        from_attributes = True


class WorkoutProgress(BaseModel):
    workout_id: Optional[int] = None
    date: date
    day_type: str
    in_progress: bool = True
    completed: bool = False
    exercises: List[ExerciseCreate] = [] 