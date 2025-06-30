from sqlalchemy.orm import Session
from app.models.user_profile import UserProfile
from app.models.user import User
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.training import OneRepMax

class UserProfileService:
    
    @staticmethod
    def get_user_profile(db: Session, user_id: int) -> Optional[UserProfile]:
        """Get user profile by user ID"""
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    @staticmethod
    def create_user_profile(db: Session, user_id: int, profile_data: Dict[str, Any]) -> UserProfile:
        """Create a new user profile"""
        profile = UserProfile(
            user_id=user_id,
            body_weight=profile_data.get('body_weight', 0),
            height=profile_data.get('height', 0),
            age=profile_data.get('age', 0),
            gender=profile_data.get('gender', 'male'),
            experience_level=profile_data.get('experience_level', 'beginner'),
            training_goals=profile_data.get('training_goals', []),
            training_frequency=profile_data.get('training_frequency', '3-4'),
            preferred_training_time=profile_data.get('preferred_training_time', 'afternoon'),
            available_training_days=profile_data.get('available_training_days', []),
            max_session_duration=profile_data.get('max_session_duration', 60),
            has_injuries=profile_data.get('has_injuries', False),
            injury_details=profile_data.get('injury_details', ''),
            medical_conditions=profile_data.get('medical_conditions', ''),
            has_pull_up_bar=profile_data.get('has_pull_up_bar', True),
            has_dip_bars=profile_data.get('has_dip_bars', True),
            has_weights=profile_data.get('has_weights', False),
            has_gym_access=profile_data.get('has_gym_access', False),
            has_completed_setup=profile_data.get('has_completed_setup', False),
            setup_completed_at=datetime.utcnow() if profile_data.get('has_completed_setup') else None
        )
        
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    
    @staticmethod
    def update_user_profile(db: Session, user_id: int, profile_data: Dict[str, Any]) -> Optional[UserProfile]:
        """Update user profile"""
        profile = UserProfileService.get_user_profile(db, user_id)
        
        if not profile:
            return None
        
        # Update fields
        for field, value in profile_data.items():
            if hasattr(profile, field):
                if field == 'has_completed_setup' and value and not profile.has_completed_setup:
                    profile.setup_completed_at = datetime.utcnow()
                setattr(profile, field, value)
        
        db.commit()
        db.refresh(profile)
        return profile
    
    @staticmethod
    def complete_setup(db: Session, user_id: int, setup_data: Dict[str, Any]) -> UserProfile:
        """Complete user setup and mark as completed"""
        profile = UserProfileService.get_user_profile(db, user_id)
        
        if profile:
            # Update existing profile
            for field, value in setup_data.items():
                if hasattr(profile, field):
                    setattr(profile, field, value)
            
            profile.has_completed_setup = True
            profile.setup_completed_at = datetime.utcnow()
        else:
            # Create new profile
            setup_data['has_completed_setup'] = True
            setup_data['setup_completed_at'] = datetime.utcnow()
            profile = UserProfileService.create_user_profile(db, user_id, setup_data)
        
        # Create OneRepMax records if initial values are provided
        exercises = [
            ('initial_muscle_ups_rm', 'Muscle Up'),
            ('initial_pull_ups_rm', 'Pull Up'),
            ('initial_dips_rm', 'Dip'),
            ('initial_squats_rm', 'Squat')
        ]
        
        for field, exercise_name in exercises:
            if field in setup_data and setup_data[field] and setup_data[field] > 0:
                # Check if OneRepMax record already exists for this exercise
                existing_rm = db.query(OneRepMax).filter(
                    OneRepMax.user_id == user_id,
                    OneRepMax.exercise == exercise_name
                ).first()
                
                if not existing_rm:
                    # Create new OneRepMax record
                    one_rep_max = OneRepMax(
                        user_id=user_id,
                        exercise=exercise_name,
                        one_rm=float(setup_data[field]),
                        date_achieved=datetime.utcnow().date(),
                        created_at=datetime.utcnow()
                    )
                    db.add(one_rep_max)
        
        db.commit()
        db.refresh(profile)
        return profile
    
    @staticmethod
    def has_completed_setup(db: Session, user_id: int) -> bool:
        """Check if user has completed setup"""
        profile = UserProfileService.get_user_profile(db, user_id)
        return profile and profile.has_completed_setup if profile else False
    
    @staticmethod
    def get_setup_status(db: Session, user_id: int) -> Dict[str, Any]:
        """Get user setup status and profile data"""
        profile = UserProfileService.get_user_profile(db, user_id)
        
        if not profile:
            return {
                "has_completed_setup": False,
                "profile": None
            }
        
        return {
            "has_completed_setup": profile.has_completed_setup,
            "profile": profile.to_dict()
        } 