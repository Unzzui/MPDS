from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user_profile import (
    UserProfile, UserProfileUpdate, UserInteraction, UserInteractionCreate,
    AdaptiveDashboardResponse, UserAnalytics, UserExperienceLevel,
    InteractionType
)
from app.services.user_adaptation import UserAdaptationService

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's adaptive profile"""
    
    service = UserAdaptationService(db)
    profile = service.get_or_create_user_profile(current_user.id)
    return profile


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile preferences"""
    
    service = UserAdaptationService(db)
    profile = service.get_or_create_user_profile(current_user.id)
    
    # Update profile with provided values
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/dashboard", response_model=AdaptiveDashboardResponse)
async def get_adaptive_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized dashboard configuration.
    
    This endpoint implements the core adaptive dashboard functionality
    with built-in safeguards against user encasement.
    """
    
    service = UserAdaptationService(db)
    
    # Track this interaction
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.PAGE_VISIT,
        interaction_data={"page": "dashboard"}
    )
    
    return service.get_adaptive_dashboard(current_user.id)


@router.post("/interactions", response_model=UserInteraction)
async def track_interaction(
    interaction: UserInteractionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track user interaction for adaptive learning"""
    
    service = UserAdaptationService(db)
    
    # Override user_id from token
    interaction.user_id = current_user.id
    
    return service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=interaction.interaction_type,
        interaction_data=interaction.interaction_data,
        duration_seconds=interaction.duration_seconds,
        session_id=interaction.session_id
    )


@router.post("/level/manual-override")
async def manually_set_experience_level(
    level: UserExperienceLevel,
    reason: Optional[str] = "user_preference",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allow users to manually override their experience level.
    
    CRITICAL ANTI-BIAS FEATURE: This ensures users are never trapped
    in a level that doesn't match their actual needs or capabilities.
    """
    
    service = UserAdaptationService(db)
    
    profile = service.manually_set_user_level(
        user_id=current_user.id,
        level=level,
        reason=reason
    )
    
    return {
        "message": f"Experience level manually set to {level}",
        "profile": profile
    }


@router.delete("/level/manual-override")
async def remove_manual_level_override(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove manual level override, returning to automatic calculation"""
    
    service = UserAdaptationService(db)
    profile = service.get_or_create_user_profile(current_user.id)
    
    old_override = profile.manual_override_level
    profile.manual_override_level = None
    
    # Trigger recalculation
    service._recalculate_user_level(profile)
    
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.SETTINGS_CHANGE,
        interaction_data={
            "action": "removed_manual_override",
            "previous_override": old_override,
            "new_calculated_level": profile.experience_level
        }
    )
    
    return {
        "message": "Manual override removed, using automatic level calculation",
        "new_level": profile.experience_level
    }


@router.get("/analytics", response_model=UserAnalytics)
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics about user behavior and adaptation"""
    
    service = UserAdaptationService(db)
    
    # Track analytics access
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.FEATURE_USE,
        interaction_data={"feature": "user_analytics"}
    )
    
    return service.get_user_analytics(current_user.id)


@router.post("/recalculate-level")
async def force_level_recalculation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force recalculation of user experience level"""
    
    service = UserAdaptationService(db)
    profile = service.get_or_create_user_profile(current_user.id)
    
    # Don't recalculate if user has manual override
    if profile.manual_override_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot recalculate level while manual override is active"
        )
    
    old_level = profile.experience_level
    changed = service._recalculate_user_level(profile)
    
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.FEATURE_USE,
        interaction_data={
            "feature": "force_recalculation",
            "old_level": old_level,
            "new_level": profile.experience_level,
            "changed": changed
        }
    )
    
    return {
        "message": "Level recalculation completed",
        "changed": changed,
        "old_level": old_level,
        "new_level": profile.experience_level
    }


@router.get("/available-levels", response_model=List[Dict[str, Any]])
async def get_available_experience_levels():
    """Get list of available experience levels with descriptions"""
    
    levels = [
        {
            "value": UserExperienceLevel.ABSOLUTE_BEGINNER,
            "label": "Absolute Beginner",
            "description": "New to strength training, needs simple guidance",
            "features": ["Basic workout logging", "Simple progress tracking", "Essential guidance"]
        },
        {
            "value": UserExperienceLevel.COMMITTED_BEGINNER,
            "label": "Committed Beginner",
            "description": "Consistent trainer, ready for basic periodization",
            "features": ["Routine creation", "Basic progress analysis", "1RM projections"]
        },
        {
            "value": UserExperienceLevel.INTERMEDIATE,
            "label": "Intermediate",
            "description": "Experienced trainer, wants detailed tracking",
            "features": ["Training blocks", "Advanced analytics", "Load management"]
        },
        {
            "value": UserExperienceLevel.ADVANCED,
            "label": "Advanced",
            "description": "Serious athlete, needs comprehensive tools",
            "features": ["Manual programming", "Advanced metrics", "Auto-regulation"]
        },
        {
            "value": UserExperienceLevel.ELITE_ATHLETE,
            "label": "Elite Athlete",
            "description": "Professional level, wants all features",
            "features": ["Full customization", "Data export", "Research tools"]
        }
    ]
    
    return levels


@router.get("/feature-discovery")
async def get_feature_discovery_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized feature discovery suggestions.
    
    ANTI-BIAS FEATURE: Actively suggests features the user hasn't tried,
    helping prevent feature blindness.
    """
    
    service = UserAdaptationService(db)
    profile = service.get_or_create_user_profile(current_user.id)
    
    unused_features = service._identify_unused_features(profile)
    
    # Map features to user-friendly descriptions
    feature_descriptions = {
        "projections": {
            "title": "1RM Projections",
            "description": "See estimated max lifts based on your recent training",
            "difficulty": "beginner"
        },
        "analytics": {
            "title": "Training Analytics",
            "description": "Deep dive into your training patterns and progress",
            "difficulty": "intermediate"
        },
        "custom_routines": {
            "title": "Custom Routines",
            "description": "Create personalized training programs",
            "difficulty": "beginner"
        },
        "training_blocks": {
            "title": "Training Blocks",
            "description": "Plan periodized training cycles",
            "difficulty": "intermediate"
        },
        "data_export": {
            "title": "Data Export",
            "description": "Export your training data for external analysis",
            "difficulty": "advanced"
        },
        "manual_programming": {
            "title": "Manual Programming",
            "description": "Fine-tune your training program parameters",
            "difficulty": "advanced"
        },
        "auto_regulation": {
            "title": "Auto-regulation",
            "description": "Automatically adjust training based on performance",
            "difficulty": "advanced"
        }
    }
    
    suggestions = []
    for feature in unused_features[:5]:  # Limit to 5 suggestions
        if feature in feature_descriptions:
            suggestions.append(feature_descriptions[feature])
    
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.FEATURE_USE,
        interaction_data={
            "feature": "feature_discovery",
            "suggested_features": unused_features[:5]
        }
    )
    
    return {
        "suggestions": suggestions,
        "total_unused": len(unused_features),
        "message": "Explore new features to enhance your training experience"
    }


@router.post("/feedback")
async def provide_adaptation_feedback(
    feedback_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allow users to provide feedback on the adaptive system.
    
    This helps improve the system and provides another anti-bias mechanism.
    """
    
    service = UserAdaptationService(db)
    
    # Track feedback as interaction
    service.track_user_interaction(
        user_id=current_user.id,
        interaction_type=InteractionType.FEATURE_USE,
        interaction_data={
            "feature": "adaptation_feedback",
            "feedback": feedback_data
        }
    )
    
    return {
        "message": "Thank you for your feedback! This helps us improve the adaptive system.",
        "feedback_received": True
    }
