"""
API endpoints for training program templates and automatic program generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.program_templates import (
    TrainingProgramTemplate, ProgramGenerationRequest, ProgramGenerationResponse,
    ProgramOverview, WeeklyPlanView, TemplateRecommendation, OneRepMaxSchema,
    OneRepMaxCreate, OneRepMaxUpdate, WorkoutCompletionRequest, WorkoutCompletionResponse,
    PlannedWorkoutSchema, UserRMData
)
from app.services.auto_program_generator import AutoProgramGeneratorService
from app.core.program_templates import (
    STREETLIFTING_PROGRAM_TEMPLATES, get_templates_by_level, 
    get_all_templates, DifficultyLevel
)
from app.models.training import OneRepMax, PlannedWorkout, TrainingBlock
from datetime import date, datetime, timedelta

router = APIRouter()


@router.get("/templates", response_model=List[TrainingProgramTemplate])
def get_program_templates(
    level: DifficultyLevel = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available program templates, optionally filtered by difficulty level"""
    
    if level:
        templates_data = get_templates_by_level(level)
    else:
        templates_data = [
            {**template, "template_key": key}
            for key, template in get_all_templates().items()
        ]
    
    # Convert to response format with additional UI-friendly data
    templates = []
    for template_data in templates_data:
        template = TrainingProgramTemplate(
            template_key=template_data.get("template_key", ""),
            name=template_data["name"],
            description=template_data["description"],
            methodology=template_data["methodology"],
            duration_weeks=template_data["duration_weeks"],
            difficulty_level=template_data["difficulty_level"],
            main_lifts=template_data["main_lifts"],
            frequency_per_week=template_data["frequency_per_week"],
            estimated_time_per_workout=60 if template_data["methodology"] == "linear_progression" else 75,
            highlights=AutoProgramGeneratorService._get_template_highlights(template_data),
            requirements=AutoProgramGeneratorService._get_template_requirements(template_data)
        )
        templates.append(template)
    
    return templates


@router.get("/templates/recommended", response_model=List[TemplateRecommendation])
def get_recommended_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recommended program templates based on user's profile and experience"""
    
    recommendations = AutoProgramGeneratorService.get_recommended_templates_for_user(
        db, current_user.id
    )
    
    # Convert to recommendation format with scoring
    template_recommendations = []
    for template_data in recommendations:
        recommendation = TemplateRecommendation(
            template=TrainingProgramTemplate(
                template_key=template_data.get("template_key", ""),
                name=template_data["name"],
                description=template_data["description"],
                methodology=template_data["methodology"],
                duration_weeks=template_data["duration_weeks"],
                difficulty_level=template_data["difficulty_level"],
                main_lifts=template_data["main_lifts"],
                frequency_per_week=template_data["frequency_per_week"]
            ),
            match_score=0.8,  # This would be calculated based on user profile
            reasons=["Good for your experience level", "Matches your available time"],
            estimated_difficulty=template_data["difficulty_level"],
            time_commitment=f"{template_data['frequency_per_week']} days/week, ~60min/session"
        )
        template_recommendations.append(recommendation)
    
    return template_recommendations


@router.post("/generate", response_model=ProgramGenerationResponse)
def generate_program_from_template(
    request: ProgramGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a complete training program from a template"""
    
    try:
        # Convert UserRMData to dict for the service
        user_rms = {
            "pullups": request.user_rms.pullups,
            "dips": request.user_rms.dips,
            "muscle_ups": request.user_rms.muscle_ups,
            "squats": request.user_rms.squats,
            "deadlift": request.user_rms.deadlift,
            "bench_press": request.user_rms.bench_press,
            "overhead_press": request.user_rms.overhead_press
        }
        
        # Generate the complete program
        block = AutoProgramGeneratorService.create_program_from_template(
            db=db,
            user_id=current_user.id,
            template_key=request.template_key,
            start_date=request.start_date,
            user_rms=user_rms,
            customizations=request.customizations
        )
        
        # Count total workouts
        total_workouts = db.query(PlannedWorkout).filter(
            PlannedWorkout.block_id == block.id
        ).count()
        
        return ProgramGenerationResponse(
            success=True,
            message=f"Successfully generated {block.name}",
            block_id=block.id,
            block_name=block.name,
            total_weeks=block.total_weeks,
            total_workouts=total_workouts,
            start_date=block.start_date,
            end_date=block.end_date
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error generating program: {str(e)}"
        )


@router.get("/programs/{block_id}/overview", response_model=ProgramOverview)
def get_program_overview(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete overview of a generated program"""
    
    block = db.query(TrainingBlock).filter(
        TrainingBlock.id == block_id,
        TrainingBlock.user_id == current_user.id
    ).first()
    
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    
    # Get all planned workouts
    workouts = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == block_id
    ).order_by(PlannedWorkout.week_number, PlannedWorkout.day_number).all()
    
    # Find next uncompleted workout
    next_workout = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == block_id,
        PlannedWorkout.is_completed == False
    ).order_by(PlannedWorkout.week_number, PlannedWorkout.day_number).first()
    
    # Group workouts by week
    weekly_schedule = []
    current_week_workouts = []
    current_week_num = 1
    
    for workout in workouts:
        if workout.week_number != current_week_num:
            if current_week_workouts:
                weekly_schedule.append(AutoProgramGeneratorService._create_weekly_view(
                    current_week_num, current_week_workouts, block
                ))
            current_week_workouts = []
            current_week_num = workout.week_number
        
        current_week_workouts.append(workout)
    
    # Add the last week
    if current_week_workouts:
        weekly_schedule.append(AutoProgramGeneratorService._create_weekly_view(
            current_week_num, current_week_workouts, block
        ))
    
    # Calculate progress
    completed_workouts = len([w for w in workouts if w.is_completed])
    total_workouts = len(workouts)
    progress_percentage = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0
    
    return ProgramOverview(
        block_id=block.id,
        program_name=block.name,
        methodology=block.strategy,
        current_week=block.current_week,
        total_weeks=block.total_weeks,
        progress_percentage=progress_percentage,
        start_date=block.start_date,
        end_date=block.end_date,
        current_stage=block.current_stage,
        next_workout=PlannedWorkoutSchema.from_orm(next_workout) if next_workout else None,
        weekly_schedule=weekly_schedule
    )


@router.get("/programs/{block_id}/week/{week_number}")
def get_week_plan(
    block_id: int,
    week_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed plan for a specific week"""
    
    block = db.query(TrainingBlock).filter(
        TrainingBlock.id == block_id,
        TrainingBlock.user_id == current_user.id
    ).first()
    
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training block not found"
        )
    
    workouts = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == block_id,
        PlannedWorkout.week_number == week_number
    ).order_by(PlannedWorkout.day_number).all()
    
    if not workouts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No workouts found for week {week_number}"
        )
    
    return AutoProgramGeneratorService._create_weekly_view(week_number, workouts, block)


@router.post("/workouts/{workout_id}/complete", response_model=WorkoutCompletionResponse)
def complete_workout(
    workout_id: int,
    completion_data: WorkoutCompletionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a planned workout as completed with performance data"""
    
    workout = db.query(PlannedWorkout).join(TrainingBlock).filter(
        PlannedWorkout.id == workout_id,
        TrainingBlock.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planned workout not found"
        )
    
    if workout.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workout already completed"
        )
    
    # Update workout completion
    workout.is_completed = True
    workout.completed_at = datetime.utcnow()
    
    # Update workout notes with completion data
    completion_notes = {
        "original_notes": workout.notes,
        "completed_exercises": completion_data.completed_exercises,
        "actual_duration": completion_data.actual_duration,
        "difficulty_rating": completion_data.difficulty_rating,
        "completion_notes": completion_data.notes
    }
    workout.notes = str(completion_notes)  # Store as JSON string
    
    # Find next workout
    next_workout = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == workout.block_id,
        PlannedWorkout.is_completed == False
    ).order_by(PlannedWorkout.week_number, PlannedWorkout.day_number).first()
    
    # Check if week is completed
    week_workouts = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == workout.block_id,
        PlannedWorkout.week_number == workout.week_number
    ).all()
    
    week_completed = all(w.is_completed for w in week_workouts)
    
    # Check if entire block is completed
    all_workouts = db.query(PlannedWorkout).filter(
        PlannedWorkout.block_id == workout.block_id
    ).all()
    
    block_completed = all(w.is_completed for w in all_workouts)
    
    # Update block progress if week completed
    if week_completed and workout.block.current_week == workout.week_number:
        workout.block.current_week = min(workout.week_number + 1, workout.block.total_weeks)
    
    if block_completed:
        workout.block.status = 'completed'
    
    db.commit()
    
    # Generate achievements/feedback
    achievements = []
    if week_completed:
        achievements.append(f"Week {workout.week_number} completed!")
    if block_completed:
        achievements.append("Training block completed! Great job!")
    
    return WorkoutCompletionResponse(
        success=True,
        message="Workout completed successfully",
        next_workout=PlannedWorkoutSchema.from_orm(next_workout) if next_workout else None,
        week_completed=week_completed,
        block_completed=block_completed,
        achievements=achievements
    )


@router.get("/one-rep-maxes", response_model=List[OneRepMaxSchema])
def get_user_one_rep_maxes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all one rep maxes for the current user"""
    
    one_rep_maxes = db.query(OneRepMax).filter(
        OneRepMax.user_id == current_user.id
    ).order_by(OneRepMax.exercise, OneRepMax.date_achieved.desc()).all()
    
    return one_rep_maxes


@router.post("/one-rep-maxes", response_model=OneRepMaxSchema)
def create_one_rep_max(
    rm_data: OneRepMaxCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update a one rep max"""
    
    # Check if there's an existing 1RM for this exercise
    existing_rm = db.query(OneRepMax).filter(
        OneRepMax.user_id == current_user.id,
        OneRepMax.exercise == rm_data.exercise
    ).first()
    
    if existing_rm:
        # Update existing
        for key, value in rm_data.dict(exclude_unset=True).items():
            setattr(existing_rm, key, value)
        existing_rm.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_rm)
        return existing_rm
    else:
        # Create new
        one_rm = OneRepMax(
            user_id=current_user.id,
            **rm_data.dict()
        )
        
        # Calculate training max if not provided
        if not one_rm.training_max:
            one_rm.training_max = round(one_rm.one_rm * 0.9, 1)
        
        db.add(one_rm)
        db.commit()
        db.refresh(one_rm)
        return one_rm
