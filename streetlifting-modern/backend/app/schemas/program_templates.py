"""
Schemas for training program templates and auto-generation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from enum import Enum


class MethodologyType(str, Enum):
    LINEAR_PROGRESSION = "linear_progression"
    FIVE_THREE_ONE = "531"
    CONJUGATE = "conjugate"
    BLOCK_PERIODIZATION = "block_periodization"
    DAILY_UNDULATING = "daily_undulating"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ExerciseTemplateSchema(BaseModel):
    name: str
    category: str
    sets: int
    reps: int
    intensity: Any  # Can be percentage (int/float) or string like "bodyweight"
    rest_seconds: int
    weight: Optional[float] = None
    percentage: Optional[float] = None
    notes: Optional[str] = None


class PlannedWorkoutSchema(BaseModel):
    id: Optional[int] = None
    block_id: int
    week_number: int
    day_number: int
    workout_name: str
    focus: Optional[str] = None
    estimated_duration: Optional[int] = None
    exercises: List[ExerciseTemplateSchema]
    notes: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BlockStageSchema(BaseModel):
    id: Optional[int] = None
    block_id: int
    name: str
    week_number: int
    load_percentage: float
    volume_multiplier: float = 1.0
    intensity_focus: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrainingProgramSchema(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    methodology: MethodologyType
    duration_weeks: int
    difficulty_level: DifficultyLevel
    main_lifts: List[str]
    frequency_per_week: int
    program_structure: Dict[str, Any]
    intensity_zones: Dict[str, Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrainingProgramTemplate(BaseModel):
    """Schema for program templates before they become actual programs"""
    template_key: str
    name: str
    description: str
    methodology: MethodologyType
    duration_weeks: int
    difficulty_level: DifficultyLevel
    main_lifts: List[str]
    frequency_per_week: int
    estimated_time_per_workout: Optional[int] = None
    highlights: List[str] = []
    requirements: List[str] = []


class UserRMData(BaseModel):
    pullups: float = 0.0
    dips: float = 0.0
    muscle_ups: float = 0.0
    squats: float = 0.0
    deadlift: float = 0.0
    bench_press: float = 0.0
    overhead_press: float = 0.0


class ProgramGenerationRequest(BaseModel):
    template_key: str
    start_date: date
    user_rms: UserRMData
    customizations: Optional[Dict[str, Any]] = None


class ProgramGenerationResponse(BaseModel):
    success: bool
    message: str
    block_id: Optional[int] = None
    block_name: Optional[str] = None
    total_weeks: int
    total_workouts: int
    start_date: date
    end_date: date


class WeeklyPlanView(BaseModel):
    week_number: int
    week_dates: Dict[str, str]  # day_name -> date string
    stage_info: BlockStageSchema
    workouts: List[PlannedWorkoutSchema]
    weekly_focus: str
    weekly_notes: Optional[str] = None


class ProgramOverview(BaseModel):
    block_id: int
    program_name: str
    methodology: str
    current_week: int
    total_weeks: int
    progress_percentage: float
    start_date: date
    end_date: date
    current_stage: str
    next_workout: Optional[PlannedWorkoutSchema] = None
    weekly_schedule: List[WeeklyPlanView]


class TemplateRecommendation(BaseModel):
    template: TrainingProgramTemplate
    match_score: float
    reasons: List[str]
    estimated_difficulty: str
    time_commitment: str


class OneRepMaxSchema(BaseModel):
    id: Optional[int] = None
    user_id: int
    exercise: str
    one_rm: float
    training_max: Optional[float] = None
    date_achieved: date
    estimation_method: Optional[str] = None
    confidence_level: str = "medium"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OneRepMaxCreate(BaseModel):
    exercise: str
    one_rm: float
    training_max: Optional[float] = None
    date_achieved: Optional[date] = None
    estimation_method: Optional[str] = None
    confidence_level: str = "medium"


class OneRepMaxUpdate(BaseModel):
    one_rm: Optional[float] = None
    training_max: Optional[float] = None
    date_achieved: Optional[date] = None
    estimation_method: Optional[str] = None
    confidence_level: Optional[str] = None


class WorkoutCompletionRequest(BaseModel):
    workout_id: int
    completed_exercises: List[Dict[str, Any]]
    actual_duration: Optional[int] = None
    difficulty_rating: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class WorkoutCompletionResponse(BaseModel):
    success: bool
    message: str
    next_workout: Optional[PlannedWorkoutSchema] = None
    week_completed: bool = False
    block_completed: bool = False
    achievements: List[str] = []
