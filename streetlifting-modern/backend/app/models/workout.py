from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base


class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=True)  # Optional routine reference
    date = Column(Date, nullable=False, default=func.current_date())
    day_type = Column(String(50), nullable=False)
    success = Column(Boolean, nullable=False, default=True)
    in_progress = Column(Boolean, nullable=False, default=False)
    completed = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workouts")
    routine = relationship("Routine", back_populates="workouts")
    exercises = relationship("Exercise", back_populates="workout", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    name = Column(String(100), nullable=False)
    weight = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    rpe = Column(Float, nullable=True)
    notes = Column(String(200), nullable=True)
    completed = Column(Boolean, default=True)
    set_number = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    workout = relationship("Workout", back_populates="exercises") 