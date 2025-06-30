from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.training import OneRepMax
from app.services.user_adaptation import UserAdaptationService
from app.schemas.user_profile import InteractionType

router = APIRouter()


@router.post("/initial")
async def initial_setup(
    setup_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete initial user setup with adaptive profile initialization
    
    This endpoint:
    1. Creates initial 1RM records if provided
    2. Initializes adaptive profile
    3. Sets up dashboard configurations
    4. Tracks initial user interactions
    """
    
    try:
        # Initialize adaptive service
        adaptation_service = UserAdaptationService(db)
        
        # Ensure user profile exists (should already exist from registration)
        profile = adaptation_service.get_or_create_user_profile(current_user.id)
        
        # Process initial 1RM data if provided
        initial_1rms = setup_data.get("one_rep_maxes", [])
        created_1rms = []
        
        for rm_data in initial_1rms:
            # Create OneRepMax record
            one_rep_max = OneRepMax(
                user_id=current_user.id,
                exercise=rm_data.get("exercise"),
                one_rep_max=float(rm_data.get("weight", 0)),
                date=datetime.utcnow()
            )
            db.add(one_rep_max)
            created_1rms.append({
                "exercise": one_rep_max.exercise,
                "weight": one_rep_max.one_rep_max
            })
        
        db.commit()
        
        # Track setup completion interaction
        adaptation_service.track_user_interaction(
            user_id=current_user.id,
            interaction_type=InteractionType.FEATURE_USE,
            interaction_data={
                "feature": "initial_setup",
                "setup_completed": True,
                "one_rep_maxes_created": len(created_1rms),
                "exercises_setup": [rm["exercise"] for rm in created_1rms],
                "setup_date": datetime.utcnow().isoformat()
            }
        )
        
        # Update user profile with setup completion indicators
        profile.data_quality_score = min(1.0, len(created_1rms) / 6)  # 6 main exercises
        profile.manual_adjustments_count += 1  # Setup counts as manual adjustment
        
        # Track experience indicators from setup
        experience_indicators = setup_data.get("experience_indicators", {})
        
        if experience_indicators.get("has_previous_training", False):
            adaptation_service.track_user_interaction(
                user_id=current_user.id,
                interaction_type=InteractionType.FEATURE_USE,
                interaction_data={
                    "feature": "experience_declaration",
                    "has_previous_training": True,
                    "training_years": experience_indicators.get("training_years", 0)
                }
            )
            
            # Boost technical experience score for experienced users
            profile.technical_experience_score = min(40.0, experience_indicators.get("training_years", 0) * 5)
        
        # Set initial training frequency based on setup preferences
        weekly_frequency = setup_data.get("planned_frequency", 3)
        profile.workout_frequency_7d = weekly_frequency
        profile.workout_frequency_30d = weekly_frequency * 4
        
        db.commit()
        
        # Get adaptive dashboard for new user
        dashboard_config = adaptation_service.get_adaptive_dashboard(current_user.id)
        
        return {
            "message": "Initial setup completed successfully",
            "setup_summary": {
                "user_id": current_user.id,
                "username": current_user.username,
                "one_rep_maxes_created": len(created_1rms),
                "initial_1rms": created_1rms,
                "adaptive_level": dashboard_config.user_level,
                "dashboard_widgets": len(dashboard_config.widgets),
                "discovery_hints": dashboard_config.discovery_hints
            },
            "adaptive_dashboard": dashboard_config,
            "next_steps": [
                "Complete your first workout logging session",
                "Explore the dashboard features",
                "Set up your training routine"
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete initial setup: {str(e)}"
        )


@router.get("/status")
async def get_setup_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user needs initial setup"""
    
    # Check if user has any 1RM records
    one_rep_maxes = db.query(OneRepMax).filter(OneRepMax.user_id == current_user.id).count()
    
    # Get adaptive profile status
    adaptation_service = UserAdaptationService(db)
    profile = adaptation_service.get_or_create_user_profile(current_user.id)
    
    return {
        "needs_setup": one_rep_maxes == 0,
        "user_info": {
            "username": current_user.username,
            "email": current_user.email,
            "created_at": current_user.created_at
        },
        "profile_status": {
            "experience_level": profile.experience_level,
            "has_manual_override": profile.manual_override_level is not None,
            "data_quality_score": profile.data_quality_score,
            "adaptation_enabled": profile.auto_adaptation_enabled
        },
        "existing_data": {
            "one_rep_maxes_count": one_rep_maxes
        }
    }


@router.get("/recommendations")
async def get_setup_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized setup recommendations"""
    
    return {
        "recommended_exercises": [
            {
                "name": "Bench Press",
                "category": "Upper Body Push",
                "description": "Fundamental chest and triceps exercise",
                "why_track": "Key indicator of upper body strength"
            },
            {
                "name": "Squat",
                "category": "Lower Body",
                "description": "Compound leg exercise",
                "why_track": "Essential for lower body development"
            },
            {
                "name": "Deadlift",
                "category": "Posterior Chain",
                "description": "Full body pulling movement",
                "why_track": "Best indicator of overall strength"
            },
            {
                "name": "Pull-up",
                "category": "Upper Body Pull",
                "description": "Bodyweight pulling exercise",
                "why_track": "Relative strength indicator"
            },
            {
                "name": "Dip",
                "category": "Upper Body Push",
                "description": "Bodyweight pushing exercise",
                "why_track": "Triceps and chest development"
            },
            {
                "name": "Muscle-up",
                "category": "Advanced",
                "description": "Advanced combination movement",
                "why_track": "Elite level progression tracking"
            }
        ],
        "setup_tips": [
            "Start with exercises you're comfortable with",
            "Use conservative 1RM estimates if unsure",
            "You can always update these values later",
            "The system will learn and adapt as you train"
        ],
        "adaptive_features": [
            "Dashboard automatically adjusts to your experience level",
            "Progressive feature discovery prevents overwhelm",
            "Manual override always available for advanced users",
            "All features remain accessible regardless of level"
        ]
    }
