from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base


class TrainingProgram(Base):
    """Training program templates (e.g., 5/3/1, Linear Progression, etc.)"""
    __tablename__ = "training_programs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    methodology = Column(String(50), nullable=False)  # 531, linear, conjugate, etc.
    duration_weeks = Column(Integer, nullable=False)
    difficulty_level = Column(String(20), nullable=False)  # beginner, intermediate, advanced
    main_lifts = Column(JSON, nullable=False)  # List of main exercises
    frequency_per_week = Column(Integer, nullable=False)
    program_structure = Column(JSON, nullable=False)  # Week by week breakdown
    intensity_zones = Column(JSON, nullable=False)  # Percentage ranges for each phase
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    blocks = relationship("TrainingBlock", back_populates="program")


class TrainingBlock(Base):
    __tablename__ = "training_blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)  # weeks
    total_weeks = Column(Integer, nullable=False)
    current_stage = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    current_week = Column(Integer, nullable=False, default=1)
    current_day = Column(Integer, nullable=False, default=1)
    rm_pullups = Column(Float, nullable=False, default=0.0)
    rm_dips = Column(Float, nullable=False, default=0.0)
    rm_muscleups = Column(Float, nullable=False, default=0.0)
    rm_squats = Column(Float, nullable=False, default=0.0)
    rm_deadlift = Column(Float, nullable=False, default=0.0)
    rm_bench_press = Column(Float, nullable=False, default=0.0)
    rm_overhead_press = Column(Float, nullable=False, default=0.0)
    training_maxes = Column(JSON, nullable=True)  # Calculated training maxes (usually 90% of 1RM)
    strategy = Column(String(50), nullable=False, default="linear")
    weekly_increment = Column(Float, nullable=False, default=2.5)
    deload_week = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    status = Column(String(20), nullable=False, default='planned')  # planned, in_progress, completed
    routines_by_day = Column(JSON, nullable=True)  # Daily workout structure
    increment_type = Column(String(20), nullable=False, default='percentage')  # percentage, absolute
    auto_progression = Column(Boolean, nullable=False, default=True)
    # Campos específicos de estrategias
    volume_multiplier = Column(Float, nullable=True, default=1.0)
    intensity_focus = Column(String(50), nullable=True, default="moderate")
    daily_variation = Column(String(50), nullable=True, default="intensity")
    intensity_range = Column(String(50), nullable=True, default="70-90")
    volume_cycles = Column(Integer, nullable=True, default=3)
    max_effort_days = Column(Integer, nullable=True, default=1)
    dynamic_effort_days = Column(Integer, nullable=True, default=1)
    repetition_effort_days = Column(Integer, nullable=True, default=1)
    wave_pattern = Column(String(50), nullable=True, default="ascending")
    wave_amplitude = Column(Integer, nullable=True, default=10)
    wave_frequency = Column(String(50), nullable=True, default="weekly")
    max_reps = Column(JSON, nullable=True)  # Max reps for exercises
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="training_blocks")
    program = relationship("TrainingProgram", back_populates="blocks")
    stages = relationship("BlockStage", back_populates="block", cascade="all, delete-orphan")
    workouts = relationship("PlannedWorkout", back_populates="block", cascade="all, delete-orphan")


class BlockStage(Base):
    __tablename__ = "block_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("training_blocks.id"), nullable=False)
    name = Column(String(50), nullable=False)
    week_number = Column(Integer, nullable=False)
    load_percentage = Column(Float, nullable=False)
    volume_multiplier = Column(Float, nullable=False, default=1.0)
    intensity_focus = Column(String(50), nullable=True)  # strength, hypertrophy, power
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    block = relationship("TrainingBlock", back_populates="stages")


class PlannedWorkout(Base):
    """Pre-calculated workouts for each day of the block"""
    __tablename__ = "planned_workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("training_blocks.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    day_number = Column(Integer, nullable=False)
    workout_name = Column(String(100), nullable=False)
    focus = Column(String(50), nullable=True)  # upper, lower, full, push, pull
    estimated_duration = Column(Integer, nullable=True)  # minutes
    exercises = Column(JSON, nullable=False)  # List of exercises with sets/reps/weights
    notes = Column(Text, nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    block = relationship("TrainingBlock", back_populates="workouts")


class ExerciseTemplate(Base):
    """Exercise templates with progression schemes"""
    __tablename__ = "exercise_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # main_lift, accessory, assistance
    muscle_groups = Column(JSON, nullable=False)  # List of target muscle groups
    equipment = Column(String(100), nullable=True)
    difficulty_level = Column(String(20), nullable=False)
    progression_scheme = Column(JSON, nullable=False)  # How to progress this exercise
    rep_ranges = Column(JSON, nullable=False)  # Suggested rep ranges by goal
    intensity_guidelines = Column(JSON, nullable=False)  # %1RM or RPE guidelines
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OneRepMax(Base):
    __tablename__ = "one_rep_maxes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise = Column(String(100), nullable=False)
    one_rm = Column(Float, nullable=False)
    training_max = Column(Float, nullable=True)  # Usually 90% of 1RM
    date_achieved = Column(Date, nullable=False, default=func.current_date())
    estimation_method = Column(String(50), nullable=True)  # calculated, tested, estimated
    confidence_level = Column(String(20), nullable=False, default='medium')  # low, medium, high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="one_rep_maxes") 