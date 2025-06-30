"""
Automatic program generation service

This service creates complete training blocks with daily workouts
based on user's 1RM data and selected program template.
"""

from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import date, datetime, timedelta
import json

from app.models.training import (
    TrainingProgram, TrainingBlock, BlockStage, 
    PlannedWorkout, OneRepMax, ExerciseTemplate
)
from app.models.user import User
from app.core.program_templates import (
    STREETLIFTING_PROGRAM_TEMPLATES, 
    calculate_training_max, 
    calculate_working_weight,
    MethodologyType
)


class AutoProgramGeneratorService:
    
    @staticmethod
    def create_program_from_template(
        db: Session, 
        user_id: int, 
        template_key: str,
        start_date: date,
        user_rms: Dict[str, float],
        customizations: Optional[Dict[str, Any]] = None
    ) -> TrainingBlock:
        """
        Create a complete training block with daily workouts from a template
        """
        template = STREETLIFTING_PROGRAM_TEMPLATES.get(template_key)
        if not template:
            raise ValueError(f"Template {template_key} not found")
        
        # Create training program record
        program = AutoProgramGeneratorService._create_program_record(db, template, template_key)
        
        # Calculate training maxes from user's 1RMs
        training_maxes = AutoProgramGeneratorService._calculate_training_maxes(user_rms)
        
        # Create the training block
        block = AutoProgramGeneratorService._create_training_block(
            db, user_id, program, template, start_date, user_rms, training_maxes, customizations
        )
        
        # Generate stages
        AutoProgramGeneratorService._generate_block_stages(db, block, template)
        
        # Generate all planned workouts
        AutoProgramGeneratorService._generate_planned_workouts(db, block, template, training_maxes)
        
        db.commit()
        return block
    
    @staticmethod
    def _create_program_record(db: Session, template: Dict[str, Any], template_key: str) -> TrainingProgram:
        """Create or get existing program record"""
        existing_program = db.query(TrainingProgram).filter(
            TrainingProgram.name == template["name"]
        ).first()
        
        if existing_program:
            return existing_program
        
        program = TrainingProgram(
            name=template["name"],
            description=template["description"],
            methodology=template["methodology"],
            duration_weeks=template["duration_weeks"],
            difficulty_level=template["difficulty_level"],
            main_lifts=template["main_lifts"],
            frequency_per_week=template["frequency_per_week"],
            program_structure=template["program_structure"],
            intensity_zones=template["intensity_zones"]
        )
        
        db.add(program)
        db.flush()
        return program
    
    @staticmethod
    def _calculate_training_maxes(user_rms: Dict[str, float]) -> Dict[str, float]:
        """Calculate training maxes (90% of 1RM) for each lift"""
        training_maxes = {}
        for exercise, one_rm in user_rms.items():
            training_maxes[exercise] = calculate_training_max(one_rm, 90.0)
        return training_maxes
    
    @staticmethod
    def _create_training_block(
        db: Session,
        user_id: int,
        program: TrainingProgram,
        template: Dict[str, Any],
        start_date: date,
        user_rms: Dict[str, float],
        training_maxes: Dict[str, float],
        customizations: Optional[Dict[str, Any]]
    ) -> TrainingBlock:
        """Create the main training block record"""
        
        end_date = start_date + timedelta(weeks=template["duration_weeks"])
        
        block = TrainingBlock(
            user_id=user_id,
            program_id=program.id,
            name=f"{template['name']} - {start_date.strftime('%B %Y')}",
            duration=template["duration_weeks"],
            total_weeks=template["duration_weeks"],
            current_stage="week_1",
            start_date=start_date,
            end_date=end_date,
            current_week=1,
            current_day=1,
            rm_pullups=user_rms.get("pullups", 0),
            rm_dips=user_rms.get("dips", 0),
            rm_muscleups=user_rms.get("muscle_ups", 0),
            rm_squats=user_rms.get("squats", 0),
            rm_deadlift=user_rms.get("deadlift", 0),
            rm_bench_press=user_rms.get("bench_press", 0),
            rm_overhead_press=user_rms.get("overhead_press", 0),
            training_maxes=training_maxes,
            strategy=template["methodology"],
            weekly_increment=2.5,  # Default, can be customized
            is_active=True,
            status='planned',
            auto_progression=True
        )
        
        # Apply customizations if provided
        if customizations:
            for key, value in customizations.items():
                if hasattr(block, key):
                    setattr(block, key, value)
        
        db.add(block)
        db.flush()
        return block
    
    @staticmethod
    def _generate_block_stages(db: Session, block: TrainingBlock, template: Dict[str, Any]):
        """Generate training stages for the block"""
        
        if template["methodology"] == MethodologyType.LINEAR_PROGRESSION:
            AutoProgramGeneratorService._generate_linear_stages(db, block, template)
        elif template["methodology"] == MethodologyType.FIVE_THREE_ONE:
            AutoProgramGeneratorService._generate_531_stages(db, block, template)
        elif template["methodology"] == MethodologyType.BLOCK_PERIODIZATION:
            AutoProgramGeneratorService._generate_block_periodization_stages(db, block, template)
        elif template["methodology"] == MethodologyType.CONJUGATE:
            AutoProgramGeneratorService._generate_conjugate_stages(db, block, template)
    
    @staticmethod
    def _generate_linear_stages(db: Session, block: TrainingBlock, template: Dict[str, Any]):
        """Generate stages for linear progression"""
        program_structure = template["program_structure"]
        
        for stage_key, stage_info in program_structure.items():
            if stage_key == "weeks_1_8":
                weeks = list(range(1, 9))
            elif stage_key == "weeks_9_10":
                weeks = [9, 10]
            elif stage_key == "weeks_11_12":
                weeks = [11, 12]
            else:
                continue
            
            for week in weeks:
                stage = BlockStage(
                    block_id=block.id,
                    name=f"Week {week} - {stage_info['description']}",
                    week_number=week,
                    load_percentage=stage_info["load_percentage"],
                    volume_multiplier=stage_info["volume_multiplier"],
                    intensity_focus="strength" if week > 8 else "volume",
                    description=stage_info["description"]
                )
                db.add(stage)
    
    @staticmethod
    def _generate_531_stages(db: Session, block: TrainingBlock, template: Dict[str, Any]):
        """Generate stages for 5/3/1 methodology"""
        program_structure = template["program_structure"]
        
        for cycle_key, cycle_info in program_structure.items():
            for week in cycle_info["weeks"]:
                is_deload = week == cycle_info["deload_week"]
                
                stage = BlockStage(
                    block_id=block.id,
                    name=f"Week {week} - {cycle_info['description']}" + (" (Deload)" if is_deload else ""),
                    week_number=week,
                    load_percentage=95 if not is_deload else 60,
                    volume_multiplier=1.0 if not is_deload else 0.5,
                    intensity_focus="strength" if not is_deload else "recovery",
                    description=cycle_info["description"]
                )
                db.add(stage)
    
    @staticmethod
    def _generate_block_periodization_stages(db: Session, block: TrainingBlock, template: Dict[str, Any]):
        """Generate stages for block periodization"""
        program_structure = template["program_structure"]
        
        for block_key, block_info in program_structure.items():
            for week in block_info["weeks"]:
                stage = BlockStage(
                    block_id=block.id,
                    name=f"Week {week} - {block_info['description']}",
                    week_number=week,
                    load_percentage=block_info["load_percentage"],
                    volume_multiplier=block_info["volume_multiplier"],
                    intensity_focus=block_info["focus"],
                    description=block_info["description"]
                )
                db.add(stage)
    
    @staticmethod
    def _generate_conjugate_stages(db: Session, block: TrainingBlock, template: Dict[str, Any]):
        """Generate stages for conjugate methodology"""
        # Conjugate method has a repeating weekly pattern
        for week in range(1, template["duration_weeks"] + 1):
            stage = BlockStage(
                block_id=block.id,
                name=f"Week {week} - Conjugate Training",
                week_number=week,
                load_percentage=95,  # Varies by day
                volume_multiplier=1.0,
                intensity_focus="max_strength",
                description="Max effort and dynamic effort training"
            )
            db.add(stage)
    
    @staticmethod
    def _generate_planned_workouts(
        db: Session, 
        block: TrainingBlock, 
        template: Dict[str, Any], 
        training_maxes: Dict[str, float]
    ):
        """Generate all planned workouts for the entire block"""
        
        methodology = template["methodology"]
        
        if methodology == MethodologyType.LINEAR_PROGRESSION:
            AutoProgramGeneratorService._generate_linear_workouts(db, block, template, training_maxes)
        elif methodology == MethodologyType.FIVE_THREE_ONE:
            AutoProgramGeneratorService._generate_531_workouts(db, block, template, training_maxes)
        elif methodology == MethodologyType.BLOCK_PERIODIZATION:
            AutoProgramGeneratorService._generate_block_workouts(db, block, template, training_maxes)
        elif methodology == MethodologyType.CONJUGATE:
            AutoProgramGeneratorService._generate_conjugate_workouts(db, block, template, training_maxes)
    
    @staticmethod
    def _generate_linear_workouts(
        db: Session, 
        block: TrainingBlock, 
        template: Dict[str, Any], 
        training_maxes: Dict[str, float]
    ):
        """Generate workouts for linear progression methodology"""
        weekly_structure = template["weekly_structure"]
        frequency = template["frequency_per_week"]
        
        for week in range(1, template["duration_weeks"] + 1):
            # Calculate week-specific adjustments
            base_increment = 2.5 * (week - 1)  # Progressive loading
            
            # Determine which phase we're in
            if week <= 8:
                phase_multiplier = 1.0
                load_adjustment = 0
            elif week <= 10:
                phase_multiplier = 0.8
                load_adjustment = 5  # Intensity phase
            else:
                phase_multiplier = 0.6
                load_adjustment = 10  # Peak phase
            
            for day in range(1, frequency + 1):
                day_key = f"day_{day}"
                if day_key not in weekly_structure:
                    continue
                
                day_template = weekly_structure[day_key]
                
                # Generate exercises for this workout
                exercises = []
                for exercise_template in day_template["exercises"]:
                    exercise = AutoProgramGeneratorService._create_exercise_from_template(
                        exercise_template, training_maxes, base_increment + load_adjustment, phase_multiplier
                    )
                    exercises.append(exercise)
                
                # Create planned workout
                workout = PlannedWorkout(
                    block_id=block.id,
                    week_number=week,
                    day_number=day,
                    workout_name=day_template["name"],
                    focus=day_template["focus"],
                    estimated_duration=60,  # Default 60 minutes
                    exercises=exercises,
                    notes=f"Week {week} of linear progression"
                )
                db.add(workout)
    
    @staticmethod
    def _generate_531_workouts(
        db: Session, 
        block: TrainingBlock, 
        template: Dict[str, Any], 
        training_maxes: Dict[str, float]
    ):
        """Generate workouts for 5/3/1 methodology"""
        weekly_structure = template["weekly_structure"]
        intensity_zones = template["intensity_zones"]
        
        for week in range(1, template["duration_weeks"] + 1):
            # Determine which week in the 4-week cycle
            cycle_week = ((week - 1) % 4) + 1
            week_key = f"week_{cycle_week}"
            
            if week_key not in intensity_zones:
                continue
            
            week_scheme = intensity_zones[week_key]
            
            for day in range(1, 5):  # 4 days per week
                day_key = f"day_{day}"
                if day_key not in weekly_structure:
                    continue
                
                day_template = weekly_structure[day_key]
                main_lift = day_template["main_lift"]
                
                # Generate main lift work
                exercises = []
                
                # Main lift sets
                for i, (sets, percentage) in enumerate(zip(week_scheme["sets"], week_scheme["percentages"])):
                    weight = calculate_working_weight(training_maxes.get(main_lift, 0), percentage)
                    
                    exercise = {
                        "name": main_lift,
                        "category": "main_lift",
                        "sets": 1,
                        "reps": sets,
                        "weight": weight,
                        "percentage": percentage,
                        "rest_seconds": 180,
                        "notes": f"Set {i+1} of main work"
                    }
                    exercises.append(exercise)
                
                # Add accessories
                for accessory_name in day_template["accessories"]:
                    accessory = {
                        "name": accessory_name,
                        "category": "accessory",
                        "sets": 3,
                        "reps": 12,
                        "weight": "bodyweight",
                        "rest_seconds": 90,
                        "notes": "Accessory work"
                    }
                    exercises.append(accessory)
                
                workout = PlannedWorkout(
                    block_id=block.id,
                    week_number=week,
                    day_number=day,
                    workout_name=day_template["name"],
                    focus=day_template["focus"],
                    estimated_duration=75,
                    exercises=exercises,
                    notes=f"5/3/1 Week {cycle_week} - Cycle {(week-1)//4 + 1}"
                )
                db.add(workout)
    
    @staticmethod
    def _generate_block_workouts(
        db: Session, 
        block: TrainingBlock, 
        template: Dict[str, Any], 
        training_maxes: Dict[str, float]
    ):
        """Generate workouts for block periodization"""
        # Implementation for block periodization
        # This would create workouts based on the accumulation/intensification/realization phases
        pass
    
    @staticmethod
    def _generate_conjugate_workouts(
        db: Session, 
        block: TrainingBlock, 
        template: Dict[str, Any], 
        training_maxes: Dict[str, float]
    ):
        """Generate workouts for conjugate methodology"""
        # Implementation for conjugate method
        # This would create max effort and dynamic effort workouts
        pass
    
    @staticmethod
    def _create_exercise_from_template(
        exercise_template: Dict[str, Any], 
        training_maxes: Dict[str, float], 
        weight_increment: float, 
        volume_multiplier: float
    ) -> Dict[str, Any]:
        """Create a specific exercise from a template"""
        
        exercise_name = exercise_template["name"]
        base_intensity = exercise_template["intensity"]
        
        # Calculate weight if it's a percentage-based exercise
        if isinstance(base_intensity, (int, float)) and exercise_name in training_maxes:
            adjusted_intensity = base_intensity + (weight_increment / training_maxes[exercise_name] * 100)
            weight = calculate_working_weight(training_maxes[exercise_name], adjusted_intensity)
        else:
            weight = exercise_template["intensity"]  # Bodyweight or other
        
        # Adjust volume
        adjusted_sets = max(1, int(exercise_template["sets"] * volume_multiplier))
        
        return {
            "name": exercise_name,
            "category": exercise_template["category"],
            "sets": adjusted_sets,
            "reps": exercise_template["reps"],
            "weight": weight,
            "intensity": base_intensity if isinstance(base_intensity, str) else f"{base_intensity}%",
            "rest_seconds": exercise_template["rest_seconds"],
            "notes": f"Generated from template"
        }
    
    @staticmethod
    def regenerate_remaining_workouts(
        db: Session, 
        block_id: int, 
        from_week: int = None
    ) -> bool:
        """Regenerate workouts from a specific week onwards (useful for adjustments)"""
        # Implementation to regenerate workouts when user makes adjustments
        pass
    
    @staticmethod
    def get_recommended_templates_for_user(
        db: Session, 
        user_id: int
    ) -> List[Dict[str, Any]]:
        """Get recommended program templates based on user's experience and goals"""
        # This would analyze user's profile and suggest appropriate templates
        # For now, return all templates
        return [
            {**template, "template_key": key}
            for key, template in STREETLIFTING_PROGRAM_TEMPLATES.items()
        ]
    
    @staticmethod
    def _get_template_highlights(template: Dict[str, Any]) -> List[str]:
        """Generate highlight points for a template"""
        highlights = []
        
        methodology = template["methodology"]
        if methodology == "linear_progression":
            highlights.extend([
                "Simple progressive overload",
                "Perfect for building strength base",
                "Clear week-to-week progression"
            ])
        elif methodology == "531":
            highlights.extend([
                "Proven 5/3/1 methodology",
                "Balanced strength and volume", 
                "Built-in deload weeks"
            ])
        elif methodology == "conjugate":
            highlights.extend([
                "Advanced Westside method",
                "Max effort and speed work",
                "Constant variation"
            ])
        elif methodology == "block_periodization":
            highlights.extend([
                "Systematic periodization",
                "Distinct training phases",
                "Optimized for competition"
            ])
        
        # Add frequency and duration highlights
        if template["frequency_per_week"] <= 3:
            highlights.append("Time-efficient training")
        elif template["frequency_per_week"] >= 5:
            highlights.append("High-frequency approach")
        
        if template["duration_weeks"] <= 8:
            highlights.append("Short-term program")
        elif template["duration_weeks"] >= 16:
            highlights.append("Long-term development")
        
        return highlights
    
    @staticmethod
    def _get_template_requirements(template: Dict[str, Any]) -> List[str]:
        """Generate requirement points for a template"""
        requirements = []
        
        # Experience requirements
        level = template["difficulty_level"]
        if level == "beginner":
            requirements.append("Basic movement competency")
        elif level == "intermediate":
            requirements.extend([
                "6+ months training experience",
                "Established 1RM in main lifts"
            ])
        elif level == "advanced":
            requirements.extend([
                "2+ years consistent training",
                "Competition experience preferred",
                "High work capacity"
            ])
        
        # Time requirements
        freq = template["frequency_per_week"]
        requirements.append(f"{freq} training days per week")
        
        # Equipment requirements based on main lifts
        main_lifts = template["main_lifts"]
        if "squats" in main_lifts:
            requirements.append("Access to squat rack/weights")
        if any(lift in main_lifts for lift in ["pullups", "dips", "muscle_ups"]):
            requirements.append("Pull-up bar and dip station")
        
        return requirements
    
    @staticmethod
    def _create_weekly_view(week_number: int, workouts: List, block) -> Dict[str, Any]:
        """Create a weekly view from workouts and block data"""
        from app.schemas.program_templates import WeeklyPlanView, PlannedWorkoutSchema, BlockStageSchema
        
        # Calculate week dates
        start_date = block.start_date + timedelta(weeks=week_number - 1)
        week_dates = {}
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for i, day_name in enumerate(day_names):
            day_date = start_date + timedelta(days=i)
            week_dates[day_name.lower()] = day_date.strftime("%Y-%m-%d")
        
        # Get stage info for this week
        stage = None
        if hasattr(block, 'stages'):
            stage = next((s for s in block.stages if s.week_number == week_number), None)
        
        # Create mock stage if none exists
        if not stage:
            stage_data = {
                "id": None,
                "block_id": block.id,
                "name": f"Week {week_number}",
                "week_number": week_number,
                "load_percentage": 85.0,
                "volume_multiplier": 1.0,
                "intensity_focus": "strength",
                "description": f"Week {week_number} training"
            }
        else:
            stage_data = {
                "id": stage.id,
                "block_id": stage.block_id,
                "name": stage.name,
                "week_number": stage.week_number,
                "load_percentage": stage.load_percentage,
                "volume_multiplier": stage.volume_multiplier,
                "intensity_focus": stage.intensity_focus,
                "description": stage.description
            }
        
        return {
            "week_number": week_number,
            "week_dates": week_dates,
            "stage_info": stage_data,
            "workouts": [
                {
                    "id": w.id,
                    "block_id": w.block_id,
                    "week_number": w.week_number,
                    "day_number": w.day_number,
                    "workout_name": w.workout_name,
                    "focus": w.focus,
                    "estimated_duration": w.estimated_duration,
                    "exercises": w.exercises,
                    "notes": w.notes,
                    "is_completed": w.is_completed,
                    "completed_at": w.completed_at,
                    "created_at": w.created_at
                }
                for w in workouts
            ],
            "weekly_focus": stage_data["intensity_focus"] if stage_data else "strength",
            "weekly_notes": stage_data["description"] if stage_data else None
        }
