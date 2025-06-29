from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base


class TrainingBlock(Base):
    __tablename__ = "training_blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    duration = Column(Integer, nullable=False)  # weeks
    total_weeks = Column(Integer, nullable=False)
    current_stage = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    current_week = Column(Integer, nullable=False, default=1)
    rm_pullups = Column(Float, nullable=False, default=0.0)
    rm_dips = Column(Float, nullable=False, default=0.0)
    rm_muscleups = Column(Float, nullable=False, default=0.0)
    rm_squats = Column(Float, nullable=False, default=0.0)
    strategy = Column(String(50), nullable=False, default="default")
    weekly_increment = Column(Float, nullable=False, default=3.0)
    deload_week = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    status = Column(String(20), nullable=False, default='planned')  # planned, in_progress, completed
    routines_by_day = Column(Text, nullable=True)  # JSON string
    increment_type = Column(String(20), nullable=False, default='percentage')  # percentage, absolute
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="training_blocks")
    stages = relationship("BlockStage", back_populates="block", cascade="all, delete-orphan")


class BlockStage(Base):
    __tablename__ = "block_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("training_blocks.id"), nullable=False)
    name = Column(String(50), nullable=False)
    week_number = Column(Integer, nullable=False)
    load_percentage = Column(Float, nullable=False)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    block = relationship("TrainingBlock", back_populates="stages")


class OneRepMax(Base):
    __tablename__ = "one_rep_maxes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise = Column(String(100), nullable=False)
    one_rm = Column(Float, nullable=False)
    date_achieved = Column(Date, nullable=False, default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="one_rep_maxes") 