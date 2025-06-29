from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class BlockStageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    week_number: int = Field(..., ge=1)
    load_percentage: float = Field(..., ge=0, le=100)
    description: Optional[str] = None


class BlockStageCreate(BlockStageBase):
    pass


class BlockStage(BlockStageBase):
    id: int
    block_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TrainingBlockBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    duration: int = Field(..., ge=1, le=52)
    total_weeks: int = Field(..., ge=1, le=52)
    current_stage: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date
    current_week: int = Field(..., ge=1)
    rm_pullups: float = Field(..., ge=0)
    rm_dips: float = Field(..., ge=0)
    rm_muscleups: float = Field(..., ge=0)
    rm_squats: float = Field(..., ge=0)
    strategy: str = Field(..., min_length=1, max_length=100)
    weekly_increment: float = Field(..., ge=0)
    deload_week: Optional[int] = Field(None, ge=1, le=52)
    routines_by_day: Optional[str] = None  # JSON string
    increment_type: str = Field(default="percentage", pattern="^(percentage|absolute)$")


class TrainingBlockCreate(TrainingBlockBase):
    stages: List[BlockStageCreate] = []


class TrainingBlockUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    duration: Optional[int] = Field(None, ge=1, le=52)
    total_weeks: Optional[int] = Field(None, ge=1, le=52)
    current_stage: Optional[str] = Field(None, min_length=1, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current_week: Optional[int] = Field(None, ge=1)
    rm_pullups: Optional[float] = Field(None, ge=0)
    rm_dips: Optional[float] = Field(None, ge=0)
    rm_muscleups: Optional[float] = Field(None, ge=0)
    rm_squats: Optional[float] = Field(None, ge=0)
    strategy: Optional[str] = Field(None, min_length=1, max_length=100)
    weekly_increment: Optional[float] = Field(None, ge=0)
    deload_week: Optional[int] = Field(None, ge=1, le=52)
    is_active: Optional[bool] = None
    status: Optional[str] = Field(None, pattern="^(planned|in_progress|completed)$")
    routines_by_day: Optional[str] = None
    increment_type: Optional[str] = Field(None, pattern="^(percentage|absolute)$")


class TrainingBlock(TrainingBlockBase):
    id: int
    user_id: int
    is_active: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    stages: List[BlockStage] = []

    class Config:
        from_attributes = True


class BlockProgress(BaseModel):
    current_week: int
    total_weeks: int
    progress_percentage: float
    next_workout: Optional[str] = None
    weekly_projections: Dict[str, Dict[str, float]]
    rpe_tables: Dict[str, Dict[str, List[float]]]


class WeeklyProjection(BaseModel):
    week: str
    projections: Dict[str, float]


class RpeTable(BaseModel):
    exercise: str
    rpe_values: Dict[str, List[float]] 