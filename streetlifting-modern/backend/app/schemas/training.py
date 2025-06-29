from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class BlockStageBase(BaseModel):
    name: str
    week_number: int = Field(..., gt=0)
    load_percentage: float = Field(..., gt=0, le=100)
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
    name: str
    duration: int = Field(..., gt=0)
    total_weeks: int = Field(..., gt=0)
    current_stage: str
    start_date: date
    end_date: date
    current_week: int = Field(1, gt=0)
    rm_pullups: float = Field(0.0, ge=0)
    rm_dips: float = Field(0.0, ge=0)
    rm_muscleups: float = Field(0.0, ge=0)
    rm_squats: float = Field(0.0, ge=0)
    strategy: str = "default"
    weekly_increment: float = Field(3.0, gt=0)
    deload_week: Optional[int] = Field(None, gt=0)


class TrainingBlockCreate(TrainingBlockBase):
    stages: List[BlockStageCreate] = []


class TrainingBlockUpdate(BaseModel):
    name: Optional[str] = None
    current_stage: Optional[str] = None
    current_week: Optional[int] = Field(None, gt=0)
    rm_pullups: Optional[float] = Field(None, ge=0)
    rm_dips: Optional[float] = Field(None, ge=0)
    rm_muscleups: Optional[float] = Field(None, ge=0)
    rm_squats: Optional[float] = Field(None, ge=0)
    strategy: Optional[str] = None
    weekly_increment: Optional[float] = Field(None, gt=0)
    deload_week: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class TrainingBlock(TrainingBlockBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    stages: List[BlockStage] = []
    
    class Config:
        from_attributes = True


class OneRepMaxBase(BaseModel):
    exercise: str
    one_rm: float = Field(..., gt=0)
    date_achieved: date


class OneRepMaxCreate(OneRepMaxBase):
    pass


class OneRepMaxUpdate(BaseModel):
    one_rm: Optional[float] = Field(None, gt=0)
    date_achieved: Optional[date] = None


class OneRepMax(OneRepMaxBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SuggestedWeights(BaseModel):
    exercise: str
    weights_3x3: float
    weights_3x5: float
    weights_3x8: float


class TrainingProgress(BaseModel):
    current_block: Optional[TrainingBlock] = None
    suggested_weights: List[SuggestedWeights] = []
    current_week: int
    total_weeks: int 