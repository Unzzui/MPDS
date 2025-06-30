from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import json
import math
from collections import defaultdict

from app.models.user_profile import (
    UserProfile, UserInteraction, DashboardConfiguration, 
    UserExperienceLevel
)
from app.models.user import User
from app.models.workout import Workout
from app.schemas.user_profile import (
    UserProfileCreate, UserProfileUpdate, UserInteractionCreate,
    AdaptiveDashboardResponse, UserAnalytics, LevelTransition,
    DashboardWidget, InteractionType
)


class UserAdaptationService:
    """
    Core service for user experience adaptation and personalization.
    
    This service addresses the critical concerns about user classification bias
    by implementing multiple safeguards and escape mechanisms.
    """
    
    # Experience level thresholds and weights
    LEVEL_THRESHOLDS = {
        UserExperienceLevel.ABSOLUTE_BEGINNER: {"min_score": 0.0, "max_score": 20.0},
        UserExperienceLevel.COMMITTED_BEGINNER: {"min_score": 20.0, "max_score": 40.0},
        UserExperienceLevel.INTERMEDIATE: {"min_score": 40.0, "max_score": 65.0},
        UserExperienceLevel.ADVANCED: {"min_score": 65.0, "max_score": 85.0},
        UserExperienceLevel.ELITE_ATHLETE: {"min_score": 85.0, "max_score": 100.0},
    }
    
    # Scoring weights for different aspects
    SCORING_WEIGHTS = {
        "technical_experience": 0.35,
        "training_commitment": 0.35,
        "needs_sophistication": 0.30,
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_user_profile(self, user_id: int) -> UserProfile:
        """Get existing profile or create new one with safeguards"""
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if not profile:
            profile_data = UserProfileCreate(user_id=user_id)
            profile = UserProfile(**profile_data.dict())
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
            
            # Initialize default dashboard configurations if not exist
            self._ensure_dashboard_configurations_exist()
        
        return profile
    
    def track_user_interaction(
        self, 
        user_id: int, 
        interaction_type: InteractionType,
        interaction_data: Dict[str, Any] = None,
        duration_seconds: Optional[float] = None,
        session_id: Optional[str] = None
    ) -> UserInteraction:
        """Track user interaction and trigger adaptation if needed"""
        
        profile = self.get_or_create_user_profile(user_id)
        
        interaction = UserInteraction(
            user_id=user_id,
            interaction_type=interaction_type,
            interaction_data=interaction_data or {},
            duration_seconds=duration_seconds,
            session_id=session_id,
            user_level_at_time=profile.experience_level
        )
        
        self.db.add(interaction)
        self.db.commit()
        
        # Update profile metrics based on interaction
        self._update_profile_from_interaction(profile, interaction)
        
        # Check if level recalculation is needed
        if self._should_recalculate_level(profile):
            self._recalculate_user_level(profile)
        
        return interaction
    
    def get_adaptive_dashboard(self, user_id: int) -> AdaptiveDashboardResponse:
        """
        Get personalized dashboard configuration with anti-bias safeguards.
        
        CRITICAL SAFEGUARDS:
        1. Always include escape hatch for accessing advanced features
        2. Provide discovery hints for next-level functionality 
        3. Allow manual level override
        4. Regular level re-evaluation
        """
        
        profile = self.get_or_create_user_profile(user_id)
        
        # Use manual override if set, otherwise use calculated level
        effective_level = profile.manual_override_level or profile.experience_level
        
        # Get base configuration for level
        config = self._get_dashboard_configuration(effective_level)
        
        # Generate adaptive widgets
        widgets = self._generate_adaptive_widgets(profile, effective_level)
        
        # Generate discovery hints to prevent user encasement
        discovery_hints = self._generate_discovery_hints(profile, effective_level)
        
        # Generate suggested actions
        suggested_actions = self._generate_suggested_actions(profile, effective_level)
        
        # Level progression status
        progression_status = self._get_level_progression_status(profile)
        
        return AdaptiveDashboardResponse(
            user_level=effective_level,
            configuration=config,
            widgets=widgets,
            suggested_actions=suggested_actions,
            discovery_hints=discovery_hints,
            level_progression_status=progression_status
        )
    
    def manually_set_user_level(
        self, 
        user_id: int, 
        level: UserExperienceLevel,
        reason: str = "manual_override"
    ) -> UserProfile:
        """Allow users to manually override their experience level"""
        
        profile = self.get_or_create_user_profile(user_id)
        old_level = profile.experience_level
        
        profile.manual_override_level = level
        profile.updated_at = datetime.utcnow()
        
        # Track this as an interaction
        self.track_user_interaction(
            user_id=user_id,
            interaction_type=InteractionType.MANUAL_OVERRIDE,
            interaction_data={
                "from_level": old_level,
                "to_level": level,
                "reason": reason
            }
        )
        
        self.db.commit()
        return profile
    
    def get_user_analytics(self, user_id: int) -> UserAnalytics:
        """Get detailed analytics about user behavior and adaptation"""
        
        profile = self.get_or_create_user_profile(user_id)
        
        # Get recent interactions
        recent_interactions = self.db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).order_by(desc(UserInteraction.created_at)).limit(20).all()
        
        # Calculate breakdown scores
        technical_breakdown = self._calculate_technical_experience_breakdown(profile)
        commitment_breakdown = self._calculate_commitment_breakdown(profile)
        sophistication_breakdown = self._calculate_sophistication_breakdown(profile)
        
        # Get level progression timeline
        progression_timeline = self._get_level_progression_timeline(user_id)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(profile)
        
        return UserAnalytics(
            technical_experience_breakdown=technical_breakdown,
            commitment_indicators=commitment_breakdown,
            sophistication_metrics=sophistication_breakdown,
            recent_interactions=recent_interactions,
            level_progression_timeline=progression_timeline,
            recommendations=recommendations
        )
    
    def _recalculate_user_level(self, profile: UserProfile) -> bool:
        """
        Recalculate user experience level based on multiple metrics.
        
        ANTI-BIAS MEASURES:
        1. Uses multiple scoring dimensions to avoid single-factor bias
        2. Includes degradation mechanism if user becomes less active
        3. Has minimum thresholds to prevent premature classification
        4. Considers time-based factors to account for skill development
        """
        
        # Don't override manual level settings
        if profile.manual_override_level:
            return False
        
        old_level = profile.experience_level
        
        # Calculate component scores
        technical_score = self._calculate_technical_experience_score(profile)
        commitment_score = self._calculate_training_commitment_score(profile)
        sophistication_score = self._calculate_needs_sophistication_score(profile)
        
        # Update individual scores
        profile.technical_experience_score = technical_score
        profile.training_commitment_score = commitment_score
        profile.needs_sophistication_score = sophistication_score
        
        # Calculate weighted composite score
        composite_score = (
            technical_score * self.SCORING_WEIGHTS["technical_experience"] +
            commitment_score * self.SCORING_WEIGHTS["training_commitment"] +
            sophistication_score * self.SCORING_WEIGHTS["needs_sophistication"]
        )
        
        # Determine new level based on composite score
        new_level = self._score_to_level(composite_score)
        
        # Apply degradation protection: don't downgrade too quickly
        if self._is_downgrade(old_level, new_level):
            if not self._should_allow_downgrade(profile, old_level, new_level):
                new_level = old_level
        
        # Update profile
        profile.experience_level = new_level
        profile.last_level_calculation = datetime.utcnow()
        profile.updated_at = datetime.utcnow()
        
        # Track level transition if changed
        if old_level != new_level:
            self._track_level_transition(profile.user_id, old_level, new_level, composite_score)
        
        self.db.commit()
        return old_level != new_level
    
    def _calculate_technical_experience_score(self, profile: UserProfile) -> float:
        """Calculate technical experience based on terminology, manual overrides, etc."""
        
        score = 0.0
        
        # Terminology usage (0-25 points)
        term_count = len(profile.terminology_usage)
        score += min(25, term_count * 2.5)
        
        # Manual adjustments (0-25 points)
        adjustments = min(20, profile.manual_adjustments_count)
        score += adjustments * 1.25
        
        # Feature usage diversity (0-25 points)
        features_used = len(profile.feature_usage_frequency)
        score += min(25, features_used * 1.67)
        
        # Help requests inverse scoring (0-25 points)
        # Fewer basic help requests = higher score
        basic_help = profile.help_requests.get("basic_concepts", 0)
        score += max(0, 25 - basic_help * 2.5)
        
        return min(100, score)
    
    def _calculate_training_commitment_score(self, profile: UserProfile) -> float:
        """Calculate training commitment based on consistency and data quality"""
        
        score = 0.0
        
        # 7-day frequency (0-30 points)
        weekly_freq = min(7, profile.workout_frequency_7d)
        score += weekly_freq * 4.29  # 7 workouts = 30 points
        
        # 30-day frequency (0-25 points)
        monthly_freq = min(30, profile.workout_frequency_30d)
        score += monthly_freq * 0.83  # 30 workouts = 25 points
        
        # Data quality (0-25 points)
        score += profile.data_quality_score * 25
        
        # Session duration average (0-20 points)
        # Longer sessions indicate more engagement
        avg_duration_minutes = profile.session_duration_avg / 60
        score += min(20, avg_duration_minutes * 0.67)  # 30 min = 20 points
        
        return min(100, score)
    
    def _calculate_needs_sophistication_score(self, profile: UserProfile) -> float:
        """Calculate sophistication of user needs based on what they seek and use"""
        
        score = 0.0
        
        # Advanced navigation patterns (0-30 points)
        advanced_sections = ["analytics", "projections", "advanced_stats", "export"]
        advanced_usage = sum(profile.navigation_patterns.get(section, 0) for section in advanced_sections)
        score += min(30, advanced_usage * 2)
        
        # Complex feature usage (0-35 points)
        complex_features = ["manual_programming", "advanced_analytics", "data_export", "custom_formulas"]
        complex_usage = sum(profile.feature_usage_frequency.get(feature, 0) for feature in complex_features)
        score += min(35, complex_usage * 3.5)
        
        # Analysis depth (0-35 points)
        # Based on time spent in analysis sections
        analysis_time = profile.navigation_patterns.get("detailed_analysis_time", 0)
        score += min(35, analysis_time / 60 * 0.58)  # 1 hour = 35 points
        
        return min(100, score)
    
    def _score_to_level(self, score: float) -> UserExperienceLevel:
        """Convert composite score to experience level"""
        
        for level, thresholds in self.LEVEL_THRESHOLDS.items():
            if thresholds["min_score"] <= score < thresholds["max_score"]:
                return level
        
        # Default to highest level if score exceeds all thresholds
        return UserExperienceLevel.ELITE_ATHLETE
    
    def _generate_discovery_hints(
        self, 
        profile: UserProfile, 
        current_level: UserExperienceLevel
    ) -> List[str]:
        """
        Generate hints to help users discover features they might not know about.
        
        CRITICAL ANTI-BIAS FEATURE: Always suggests ways to access more advanced functionality
        """
        
        hints = []
        
        # Always include escape hatch
        hints.append("💡 Tap 'Advanced View' anytime to access all features")
        
        # Level-specific discovery hints
        if current_level == UserExperienceLevel.ABSOLUTE_BEGINNER:
            hints.extend([
                "📊 Track your progress by logging RPE (Rate of Perceived Exertion)",
                "📈 View your strength trends in the Progress section",
                "🎯 Set training goals to stay motivated"
            ])
        
        elif current_level == UserExperienceLevel.COMMITTED_BEGINNER:
            hints.extend([
                "🔍 Explore 1RM projections to plan your training",
                "📅 Try creating custom training blocks",
                "⚙️ Customize your dashboard layout"
            ])
        
        elif current_level == UserExperienceLevel.INTERMEDIATE:
            hints.extend([
                "📊 Deep dive into velocity-based training metrics",
                "🔬 Analyze your training load and recovery patterns",
                "📋 Export your data for external analysis"
            ])
        
        elif current_level == UserExperienceLevel.ADVANCED:
            hints.extend([
                "🧮 Try the advanced programming tools",
                "📈 Compare your performance against population norms",
                "🔧 Fine-tune auto-regulation parameters"
            ])
        
        # Add hints based on unused features
        unused_features = self._identify_unused_features(profile)
        if unused_features:
            hints.append(f"🚀 New to explore: {', '.join(unused_features[:2])}")
        
        return hints[:4]  # Limit to 4 hints to avoid overwhelming
    
    def _generate_adaptive_widgets(
        self, 
        profile: UserProfile, 
        level: UserExperienceLevel
    ) -> List[DashboardWidget]:
        """Generate widgets based on user level and preferences"""
        
        base_config = self._get_dashboard_configuration(level)
        widgets = []
        
        # Core widgets that adapt based on level
        if "quick_start" in base_config.visible_widgets:
            widgets.append(DashboardWidget(
                id="quick_start",
                title="Start Workout" if level == UserExperienceLevel.ABSOLUTE_BEGINNER else "Today's Training",
                type="action_button",
                priority=100
            ))
        
        if "progress_summary" in base_config.visible_widgets:
            complexity = "simple" if level in [UserExperienceLevel.ABSOLUTE_BEGINNER, UserExperienceLevel.COMMITTED_BEGINNER] else "detailed"
            widgets.append(DashboardWidget(
                id="progress_summary",
                title="Your Progress",
                type="progress_chart",
                settings={"complexity": complexity},
                priority=90
            ))
        
        if "recent_workouts" in base_config.visible_widgets:
            widgets.append(DashboardWidget(
                id="recent_workouts",
                title="Recent Workouts",
                type="workout_list",
                settings={"show_details": level != UserExperienceLevel.ABSOLUTE_BEGINNER},
                priority=80
            ))
        
        # Advanced widgets
        if base_config.show_projections and "projections" in base_config.visible_widgets:
            widgets.append(DashboardWidget(
                id="projections",
                title="Projected 1RM",
                type="projection_chart",
                priority=70
            ))
        
        if base_config.show_analytics and "analytics" in base_config.visible_widgets:
            widgets.append(DashboardWidget(
                id="analytics",
                title="Training Analytics",
                type="analytics_panel",
                priority=60
            ))
        
        return sorted(widgets, key=lambda w: w.priority, reverse=True)
    
    def _ensure_dashboard_configurations_exist(self):
        """Ensure default dashboard configurations exist for all levels"""
        
        default_configs = {
            UserExperienceLevel.ABSOLUTE_BEGINNER: {
                "visible_widgets": ["quick_start", "progress_summary"],
                "widget_order": ["quick_start", "progress_summary"],
                "visible_nav_items": ["dashboard", "workouts", "progress"],
                "featured_actions": ["log_workout"],
                "show_advanced_metrics": False,
                "show_projections": False,
                "show_analytics": False,
                "enable_manual_overrides": False,
                "suggested_features": ["track_rpe", "view_progress"],
                "onboarding_flow": ["welcome", "first_workout", "track_progress"]
            },
            UserExperienceLevel.COMMITTED_BEGINNER: {
                "visible_widgets": ["quick_start", "progress_summary", "recent_workouts"],
                "widget_order": ["quick_start", "progress_summary", "recent_workouts"],
                "visible_nav_items": ["dashboard", "workouts", "progress", "routines"],
                "featured_actions": ["log_workout", "view_progress"],
                "show_advanced_metrics": False,
                "show_projections": True,
                "show_analytics": False,
                "enable_manual_overrides": False,
                "suggested_features": ["create_routine", "set_goals"],
                "onboarding_flow": ["routine_intro", "goal_setting"]
            },
            UserExperienceLevel.INTERMEDIATE: {
                "visible_widgets": ["quick_start", "progress_summary", "recent_workouts", "projections"],
                "widget_order": ["quick_start", "progress_summary", "projections", "recent_workouts"],
                "visible_nav_items": ["dashboard", "workouts", "progress", "routines", "analytics"],
                "featured_actions": ["log_workout", "view_analytics", "plan_block"],
                "show_advanced_metrics": True,
                "show_projections": True,
                "show_analytics": True,
                "enable_manual_overrides": False,
                "suggested_features": ["training_blocks", "load_management"],
                "onboarding_flow": ["blocks_intro", "analytics_tour"]
            },
            UserExperienceLevel.ADVANCED: {
                "visible_widgets": ["quick_start", "progress_summary", "projections", "analytics", "recent_workouts"],
                "widget_order": ["quick_start", "analytics", "projections", "progress_summary", "recent_workouts"],
                "visible_nav_items": ["dashboard", "workouts", "progress", "routines", "analytics", "settings"],
                "featured_actions": ["log_workout", "analyze_data", "adjust_program"],
                "show_advanced_metrics": True,
                "show_projections": True,
                "show_analytics": True,
                "enable_manual_overrides": True,
                "suggested_features": ["auto_regulation", "advanced_programming"],
                "onboarding_flow": ["advanced_features_tour"]
            },
            UserExperienceLevel.ELITE_ATHLETE: {
                "visible_widgets": ["analytics", "projections", "progress_summary", "quick_start", "recent_workouts"],
                "widget_order": ["analytics", "projections", "progress_summary", "quick_start", "recent_workouts"],
                "visible_nav_items": ["dashboard", "workouts", "progress", "routines", "analytics", "settings", "export"],
                "featured_actions": ["analyze_data", "export_data", "customize_program"],
                "show_advanced_metrics": True,
                "show_projections": True,
                "show_analytics": True,
                "enable_manual_overrides": True,
                "suggested_features": ["api_access", "custom_formulas"],
                "onboarding_flow": ["elite_features_tour"]
            }
        }
        
        for level, config_data in default_configs.items():
            existing = self.db.query(DashboardConfiguration).filter(
                DashboardConfiguration.experience_level == level
            ).first()
            
            if not existing:
                config = DashboardConfiguration(
                    experience_level=level,
                    **config_data
                )
                self.db.add(config)
        
        self.db.commit()
    
    def _get_dashboard_configuration(self, level: UserExperienceLevel) -> DashboardConfiguration:
        """Get dashboard configuration for experience level"""
        
        config = self.db.query(DashboardConfiguration).filter(
            DashboardConfiguration.experience_level == level
        ).first()
        
        if not config:
            self._ensure_dashboard_configurations_exist()
            config = self.db.query(DashboardConfiguration).filter(
                DashboardConfiguration.experience_level == level
            ).first()
        
        return config
    
    # Additional helper methods...
    def _update_profile_from_interaction(self, profile: UserProfile, interaction: UserInteraction):
        """Update profile metrics based on new interaction"""
        
        # Update navigation patterns
        if interaction.interaction_type == InteractionType.PAGE_VISIT:
            page = interaction.interaction_data.get("page", "unknown")
            profile.navigation_patterns[page] = profile.navigation_patterns.get(page, 0) + 1
        
        # Update feature usage frequency
        if interaction.interaction_type == InteractionType.FEATURE_USE:
            feature = interaction.interaction_data.get("feature", "unknown")
            profile.feature_usage_frequency[feature] = profile.feature_usage_frequency.get(feature, 0) + 1
        
        # Update session duration
        if interaction.duration_seconds:
            current_avg = profile.session_duration_avg
            # Simple moving average update
            profile.session_duration_avg = (current_avg * 0.9) + (interaction.duration_seconds * 0.1)
        
        # Track manual overrides
        if interaction.interaction_type == InteractionType.MANUAL_OVERRIDE:
            profile.manual_adjustments_count += 1
        
        # Update terminology usage
        if "terminology" in interaction.interaction_data:
            terms = interaction.interaction_data["terminology"]
            for term in terms:
                profile.terminology_usage[term] = profile.terminology_usage.get(term, 0) + 1
        
        profile.updated_at = datetime.utcnow()
        self.db.commit()
    
    def _should_recalculate_level(self, profile: UserProfile) -> bool:
        """Determine if level should be recalculated"""
        
        # Recalculate every 7 days
        days_since_last = (datetime.utcnow() - profile.last_level_calculation).days
        return days_since_last >= 7
    
    def _is_downgrade(self, old_level: UserExperienceLevel, new_level: UserExperienceLevel) -> bool:
        """Check if the level change is a downgrade"""
        
        level_order = [
            UserExperienceLevel.ABSOLUTE_BEGINNER,
            UserExperienceLevel.COMMITTED_BEGINNER,
            UserExperienceLevel.INTERMEDIATE,
            UserExperienceLevel.ADVANCED,
            UserExperienceLevel.ELITE_ATHLETE
        ]
        
        return level_order.index(new_level) < level_order.index(old_level)
    
    def _should_allow_downgrade(
        self, 
        profile: UserProfile, 
        old_level: UserExperienceLevel, 
        new_level: UserExperienceLevel
    ) -> bool:
        """Determine if downgrade should be allowed (anti-bias protection)"""
        
        # Don't downgrade if user has been inactive for less than 30 days
        days_inactive = (datetime.utcnow() - profile.updated_at).days if profile.updated_at else 0
        if days_inactive < 30:
            return False
        
        # Don't downgrade if user has used advanced features recently
        recent_advanced_usage = any(
            count > 0 for feature, count in profile.feature_usage_frequency.items()
            if feature in ["manual_programming", "advanced_analytics", "custom_formulas"]
        )
        
        if recent_advanced_usage:
            return False
        
        return True
    
    def _identify_unused_features(self, profile: UserProfile) -> List[str]:
        """Identify features the user hasn't tried yet"""
        
        all_features = [
            "projections", "analytics", "custom_routines", "training_blocks",
            "data_export", "manual_programming", "auto_regulation"
        ]
        
        used_features = set(profile.feature_usage_frequency.keys())
        return [f for f in all_features if f not in used_features]
    
    def _generate_suggested_actions(
        self, 
        profile: UserProfile, 
        level: UserExperienceLevel
    ) -> List[str]:
        """Generate contextual action suggestions"""
        
        actions = []
        
        # Always include primary action
        actions.append("Log Today's Workout")
        
        # Level-specific suggestions
        if level == UserExperienceLevel.ABSOLUTE_BEGINNER:
            actions.extend(["View Progress", "Learn About RPE"])
        elif level == UserExperienceLevel.COMMITTED_BEGINNER:
            actions.extend(["Create Routine", "Set Goals"])
        elif level == UserExperienceLevel.INTERMEDIATE:
            actions.extend(["Plan Training Block", "Analyze Progress"])
        elif level == UserExperienceLevel.ADVANCED:
            actions.extend(["Review Analytics", "Adjust Programming"])
        else:  # Elite
            actions.extend(["Deep Analytics", "Export Data"])
        
        return actions[:4]
    
    def _get_level_progression_status(self, profile: UserProfile) -> Dict[str, Any]:
        """Get information about user's progression toward next level"""
        
        current_score = (
            profile.technical_experience_score * self.SCORING_WEIGHTS["technical_experience"] +
            profile.training_commitment_score * self.SCORING_WEIGHTS["training_commitment"] +
            profile.needs_sophistication_score * self.SCORING_WEIGHTS["needs_sophistication"]
        )
        
        current_level = profile.manual_override_level or profile.experience_level
        
        # Find next level
        level_order = list(self.LEVEL_THRESHOLDS.keys())
        current_index = level_order.index(current_level)
        
        if current_index < len(level_order) - 1:
            next_level = level_order[current_index + 1]
            next_threshold = self.LEVEL_THRESHOLDS[next_level]["min_score"]
            progress_to_next = min(100, (current_score / next_threshold) * 100)
        else:
            next_level = None
            progress_to_next = 100
        
        return {
            "current_score": current_score,
            "next_level": next_level,
            "progress_to_next": progress_to_next,
            "can_advance": progress_to_next >= 90,
            "areas_to_improve": self._identify_improvement_areas(profile)
        }
    
    def _identify_improvement_areas(self, profile: UserProfile) -> List[str]:
        """Identify areas where user can improve to advance levels"""
        
        areas = []
        
        if profile.technical_experience_score < 60:
            areas.append("Learn more training terminology and concepts")
        
        if profile.training_commitment_score < 60:
            areas.append("Maintain more consistent training schedule")
        
        if profile.needs_sophistication_score < 60:
            areas.append("Explore advanced analytics and features")
        
        return areas
    
    def _calculate_technical_experience_breakdown(self, profile: UserProfile) -> Dict[str, float]:
        """Detailed breakdown of technical experience components"""
        
        return {
            "terminology_usage": min(25, len(profile.terminology_usage) * 2.5),
            "manual_adjustments": min(25, profile.manual_adjustments_count * 1.25),
            "feature_diversity": min(25, len(profile.feature_usage_frequency) * 1.67),
            "help_independence": max(0, 25 - profile.help_requests.get("basic_concepts", 0) * 2.5)
        }
    
    def _calculate_commitment_breakdown(self, profile: UserProfile) -> Dict[str, float]:
        """Detailed breakdown of training commitment components"""
        
        return {
            "weekly_frequency": min(30, profile.workout_frequency_7d * 4.29),
            "monthly_consistency": min(25, profile.workout_frequency_30d * 0.83),
            "data_quality": profile.data_quality_score * 25,
            "session_engagement": min(20, (profile.session_duration_avg / 60) * 0.67)
        }
    
    def _calculate_sophistication_breakdown(self, profile: UserProfile) -> Dict[str, float]:
        """Detailed breakdown of needs sophistication components"""
        
        advanced_sections = ["analytics", "projections", "advanced_stats", "export"]
        complex_features = ["manual_programming", "advanced_analytics", "data_export", "custom_formulas"]
        
        return {
            "advanced_navigation": min(30, sum(profile.navigation_patterns.get(s, 0) for s in advanced_sections) * 2),
            "complex_features": min(35, sum(profile.feature_usage_frequency.get(f, 0) for f in complex_features) * 3.5),
            "analysis_depth": min(35, profile.navigation_patterns.get("detailed_analysis_time", 0) / 60 * 0.58)
        }
    
    def _get_level_progression_timeline(self, user_id: int) -> List[Dict[str, Any]]:
        """Get timeline of user's level progressions"""
        
        interactions = self.db.query(UserInteraction).filter(
            and_(
                UserInteraction.user_id == user_id,
                UserInteraction.interaction_type == InteractionType.MANUAL_OVERRIDE
            )
        ).order_by(UserInteraction.created_at).all()
        
        timeline = []
        for interaction in interactions:
            data = interaction.interaction_data
            timeline.append({
                "date": interaction.created_at,
                "from_level": data.get("from_level"),
                "to_level": data.get("to_level"),
                "reason": data.get("reason", "automatic"),
                "trigger": "manual" if "manual" in data.get("reason", "") else "automatic"
            })
        
        return timeline
    
    def _generate_recommendations(self, profile: UserProfile) -> List[str]:
        """Generate personalized recommendations for user improvement"""
        
        recommendations = []
        
        # Based on scoring components
        if profile.technical_experience_score < 50:
            recommendations.append("Try using more detailed workout notes with technical terms")
        
        if profile.training_commitment_score < 50:
            recommendations.append("Focus on training consistency - aim for 3-4 sessions per week")
        
        if profile.needs_sophistication_score < 50:
            recommendations.append("Explore the analytics section to understand your progress patterns")
        
        # Based on usage patterns
        unused_features = self._identify_unused_features(profile)
        if unused_features:
            recommendations.append(f"Try exploring: {unused_features[0]}")
        
        return recommendations[:3]
    
    def _track_level_transition(
        self, 
        user_id: int, 
        from_level: UserExperienceLevel, 
        to_level: UserExperienceLevel,
        confidence_score: float
    ):
        """Track level transitions for analytics"""
        
        self.track_user_interaction(
            user_id=user_id,
            interaction_type=InteractionType.MANUAL_OVERRIDE,  # Reusing this type for system transitions
            interaction_data={
                "from_level": from_level,
                "to_level": to_level,
                "confidence_score": confidence_score,
                "trigger": "automatic_calculation"
            }
        )
