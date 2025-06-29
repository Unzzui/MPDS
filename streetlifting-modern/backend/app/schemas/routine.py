from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RoutineExerciseBase(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=255)
    order: int = Field(..., ge=0)
    sets: int = Field(..., ge=1, le=20)
    reps: str = Field(..., min_length=1, max_length=50)
    weight_percentage: Optional[int] = Field(None, ge=0, le=100)
    rest_time: Optional[int] = Field(None, ge=0)  # seconds
    is_main_lift: bool = Field(default=False)
    notes: Optional[str] = None


class RoutineExerciseCreate(RoutineExerciseBase):
    pass


class RoutineExerciseUpdate(BaseModel):
    exercise_name: Optional[str] = Field(None, min_length=1, max_length=255)
    order: Optional[int] = Field(None, ge=0)
    sets: Optional[int] = Field(None, ge=1, le=20)
    reps: Optional[str] = Field(None, min_length=1, max_length=50)
    weight_percentage: Optional[int] = Field(None, ge=0, le=100)
    rest_time: Optional[int] = Field(None, ge=0)
    is_main_lift: Optional[bool] = None
    notes: Optional[str] = None


class RoutineExercise(RoutineExerciseBase):
    id: int
    routine_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoutineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    exercises: List[str] = Field(..., min_items=1)  # List of exercise names
    days: List[int] = Field(..., min_items=1)  # List of day numbers [1-7]
    main_lifts: List[str] = Field(..., min_items=1)  # List of main lift exercise names
    is_active: bool = Field(default=True)
    is_template: bool = Field(default=False)


class RoutineCreate(RoutineBase):
    routine_exercises: Optional[List[RoutineExerciseCreate]] = []


class RoutineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    exercises: Optional[List[str]] = Field(None, min_items=1)
    days: Optional[List[int]] = Field(None, min_items=1)
    main_lifts: Optional[List[str]] = Field(None, min_items=1)
    is_active: Optional[bool] = None
    is_template: Optional[bool] = None


class Routine(RoutineBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    routine_exercises: List[RoutineExercise] = []
    
    class Config:
        from_attributes = True


class RoutineSummary(BaseModel):
    id: int
    name: str
    description: Optional[str]
    exercise_count: int
    day_count: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoutineTemplate(BaseModel):
    id: int
    name: str
    description: Optional[str]
    exercises: List[str]
    days: List[int]
    main_lifts: List[str]
    is_template: bool = True
    
    class Config:
        from_attributes = True 