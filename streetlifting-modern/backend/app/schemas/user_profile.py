from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class UserExperienceLevel(str, Enum):
    ABSOLUTE_BEGINNER = "absolute_beginner"
    COMMITTED_BEGINNER = "committed_beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ELITE_ATHLETE = "elite_athlete"


class InteractionType(str, Enum):
    PAGE_VISIT = "page_visit"
    FEATURE_USE = "feature_use"
    HELP_REQUEST = "help_request"
    MANUAL_OVERRIDE = "manual_override"
    WORKOUT_LOG = "workout_log"
    DATA_ANALYSIS = "data_analysis"
    SETTINGS_CHANGE = "settings_change"


# User Profile Schemas
class UserProfileBase(BaseModel):
    experience_level: UserExperienceLevel = UserExperienceLevel.ABSOLUTE_BEGINNER
    manual_override_level: Optional[UserExperienceLevel] = None
    preferred_dashboard_layout: str = "auto"
    feature_discovery_enabled: bool = True
    auto_adaptation_enabled: bool = True


class UserProfileCreate(UserProfileBase):
    user_id: int


class UserProfileUpdate(BaseModel):
    experience_level: Optional[UserExperienceLevel] = None
    manual_override_level: Optional[UserExperienceLevel] = None
    preferred_dashboard_layout: Optional[str] = None
    feature_discovery_enabled: Optional[bool] = None
    auto_adaptation_enabled: Optional[bool] = None


class UserProfile(UserProfileBase):
    id: int
    user_id: int
    technical_experience_score: float
    training_commitment_score: float
    needs_sophistication_score: float
    navigation_patterns: Dict[str, Any]
    feature_usage_frequency: Dict[str, Any]
    session_duration_avg: float
    terminology_usage: Dict[str, Any]
    manual_adjustments_count: int
    help_requests: Dict[str, Any]
    workout_frequency_7d: float
    workout_frequency_30d: float
    data_quality_score: float
    created_at: datetime
    updated_at: Optional[datetime]
    last_level_calculation: datetime

    class Config:
        from_attributes = True


# User Interaction Schemas
class UserInteractionBase(BaseModel):
    interaction_type: InteractionType
    interaction_data: Dict[str, Any] = {}
    duration_seconds: Optional[float] = None
    session_id: Optional[str] = None


class UserInteractionCreate(UserInteractionBase):
    user_id: Optional[int] = None  # Will be set from authentication token


class UserInteraction(UserInteractionBase):
    id: int
    user_id: int
    user_level_at_time: Optional[UserExperienceLevel]
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Configuration Schemas
class DashboardWidget(BaseModel):
    id: str
    title: str
    type: str
    settings: Dict[str, Any] = {}
    priority: int = 0


class DashboardConfigurationBase(BaseModel):
    experience_level: UserExperienceLevel
    visible_widgets: List[str] = []
    widget_order: List[str] = []
    widget_settings: Dict[str, Any] = {}
    visible_nav_items: List[str] = []
    featured_actions: List[str] = []
    show_advanced_metrics: bool = False
    show_projections: bool = False
    show_analytics: bool = False
    enable_manual_overrides: bool = False
    suggested_features: List[str] = []
    onboarding_flow: List[str] = []


class DashboardConfigurationCreate(DashboardConfigurationBase):
    pass


class DashboardConfigurationUpdate(BaseModel):
    visible_widgets: Optional[List[str]] = None
    widget_order: Optional[List[str]] = None
    widget_settings: Optional[Dict[str, Any]] = None
    visible_nav_items: Optional[List[str]] = None
    featured_actions: Optional[List[str]] = None
    show_advanced_metrics: Optional[bool] = None
    show_projections: Optional[bool] = None
    show_analytics: Optional[bool] = None
    enable_manual_overrides: Optional[bool] = None
    suggested_features: Optional[List[str]] = None
    onboarding_flow: Optional[List[str]] = None


class DashboardConfiguration(DashboardConfigurationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Adaptive Dashboard Response
class AdaptiveDashboardResponse(BaseModel):
    user_level: UserExperienceLevel
    configuration: DashboardConfiguration
    widgets: List[DashboardWidget]
    suggested_actions: List[str]
    discovery_hints: List[str]
    level_progression_status: Dict[str, Any]


# Analytics and Insights
class UserAnalytics(BaseModel):
    technical_experience_breakdown: Dict[str, float]
    commitment_indicators: Dict[str, float]
    sophistication_metrics: Dict[str, float]
    recent_interactions: List[UserInteraction]
    level_progression_timeline: List[Dict[str, Any]]
    recommendations: List[str]


class LevelTransition(BaseModel):
    from_level: UserExperienceLevel
    to_level: UserExperienceLevel
    trigger_reason: str
    confidence_score: float
    recommended_features: List[str]
    transition_date: datetime
