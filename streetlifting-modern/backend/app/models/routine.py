from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base


class Routine(Base):
    __tablename__ = "routines"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    exercises = Column(JSON, nullable=False)  # List of exercise names
    days = Column(JSON, nullable=False)  # List of day numbers [1,2,3,4,5,6,7]
    main_lifts = Column(JSON, nullable=False)  # List of main lift exercise names
    is_active = Column(Boolean, nullable=False, default=True)
    is_template = Column(Boolean, nullable=False, default=False)  # For system templates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="routines")
    workouts = relationship("Workout", back_populates="routine")
    routine_exercises = relationship("RoutineExercise", back_populates="routine", cascade="all, delete-orphan")


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=False)
    exercise_name = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False, default=0)
    sets = Column(Integer, nullable=False, default=3)
    reps = Column(String(50), nullable=False, default="8-12")  # e.g., "8-12", "5x5", "AMRAP"
    weight_percentage = Column(Integer, nullable=True)  # Percentage of 1RM
    rest_time = Column(Integer, nullable=True)  # Rest time in seconds
    is_main_lift = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    routine = relationship("Routine", back_populates="routine_exercises") 