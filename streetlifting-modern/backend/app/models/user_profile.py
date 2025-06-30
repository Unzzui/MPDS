from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.base import Base
from enum import Enum
from typing import Dict, List, Optional


class UserExperienceLevel(str, Enum):
    ABSOLUTE_BEGINNER = "absolute_beginner"
    COMMITTED_BEGINNER = "committed_beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE_ATHLETE = "elite_athlete"


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic physical data
    body_weight = Column(Float, nullable=True)  # kg
    height = Column(Float, nullable=True)  # cm
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)  # male, female, other
    
    # Experience and goals
    experience_level = Column(String(20), nullable=True)  # beginner, intermediate, advanced, expert
    training_goals = Column(JSON, nullable=True)  # Array of goals
    training_frequency = Column(String(10), nullable=True)  # 2-3, 3-4, 4-5, 5-6
    
    # Initial 1RM data
    initial_muscle_ups_rm = Column(Float, nullable=True)  # kg
    initial_pull_ups_rm = Column(Float, nullable=True)  # kg
    initial_dips_rm = Column(Float, nullable=True)  # kg
    initial_squats_rm = Column(Float, nullable=True)  # kg
    
    # Training preferences
    preferred_training_time = Column(String(20), nullable=True)  # morning, afternoon, evening
    available_training_days = Column(JSON, nullable=True)  # Array of days
    max_session_duration = Column(Integer, nullable=True)  # minutes
    
    # Health and limitations
    has_injuries = Column(Boolean, default=False)
    injury_details = Column(String(500), nullable=True)
    medical_conditions = Column(String(500), nullable=True)
    
    # Equipment access
    has_pull_up_bar = Column(Boolean, default=True)
    has_dip_bars = Column(Boolean, default=True)
    has_weights = Column(Boolean, default=False)
    has_gym_access = Column(Boolean, default=False)
    
    # Setup completion
    has_completed_setup = Column(Boolean, default=False)
    setup_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="profile")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "body_weight": self.body_weight,
            "height": self.height,
            "age": self.age,
            "gender": self.gender,
            "experience_level": self.experience_level,
            "training_goals": self.training_goals or [],
            "training_frequency": self.training_frequency,
            "initial_muscle_ups_rm": self.initial_muscle_ups_rm,
            "initial_pull_ups_rm": self.initial_pull_ups_rm,
            "initial_dips_rm": self.initial_dips_rm,
            "initial_squats_rm": self.initial_squats_rm,
            "preferred_training_time": self.preferred_training_time,
            "available_training_days": self.available_training_days or [],
            "max_session_duration": self.max_session_duration,
            "has_injuries": self.has_injuries,
            "injury_details": self.injury_details,
            "medical_conditions": self.medical_conditions,
            "has_pull_up_bar": self.has_pull_up_bar,
            "has_dip_bars": self.has_dip_bars,
            "has_weights": self.has_weights,
            "has_gym_access": self.has_gym_access,
            "has_completed_setup": self.has_completed_setup,
            "setup_completed_at": self.setup_completed_at.isoformat() if self.setup_completed_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class UserInteraction(Base):
    """Track specific user interactions for learning purposes"""
    __tablename__ = "user_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Interaction details
    interaction_type = Column(String(100), nullable=False)  # page_visit, feature_use, help_request, etc.
    interaction_data = Column(JSON, default=dict)  # Specific details about the interaction
    duration_seconds = Column(Float, nullable=True)
    
    # Context
    session_id = Column(String(100), nullable=True)
    user_level_at_time = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")


class DashboardConfiguration(Base):
    """Store dashboard configurations for different experience levels"""
    __tablename__ = "dashboard_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    experience_level = Column(String(50), nullable=False, unique=True)
    
    # Widget configuration
    visible_widgets = Column(JSON, default=list)  # List of widget IDs to show
    widget_order = Column(JSON, default=list)  # Order of widgets
    widget_settings = Column(JSON, default=dict)  # Settings for each widget
    
    # Navigation configuration
    visible_nav_items = Column(JSON, default=list)
    featured_actions = Column(JSON, default=list)  # Prominent action buttons
    
    # Complexity settings
    show_advanced_metrics = Column(Boolean, default=False)
    show_projections = Column(Boolean, default=False)
    show_analytics = Column(Boolean, default=False)
    enable_manual_overrides = Column(Boolean, default=False)
    
    # Feature discovery
    suggested_features = Column(JSON, default=list)  # Features to suggest to user
    onboarding_flow = Column(JSON, default=list)  # Steps in onboarding process
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
