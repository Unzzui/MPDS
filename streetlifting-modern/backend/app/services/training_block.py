from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
import json
from datetime import date, datetime, timedelta

from app.models.training import TrainingBlock, BlockStage
from app.schemas.training_block import TrainingBlockCreate, TrainingBlockUpdate, BlockProgress
from app.services.training_calculator import TrainingCalculatorService


class TrainingBlockService:
    
    @staticmethod
    def create_training_block(db: Session, user_id: int, block_data: TrainingBlockCreate) -> TrainingBlock:
        """Create a new training block with stages"""
        
        # Create the training block
        db_block = TrainingBlock(
            user_id=user_id,
            name=block_data.name,
            description=block_data.description,
            duration=block_data.duration,
            total_weeks=block_data.total_weeks,
            current_stage=block_data.current_stage,
            start_date=block_data.start_date,
            end_date=block_data.end_date,
            current_week=block_data.current_week,
            rm_pullups=block_data.rm_pullups,
            rm_dips=block_data.rm_dips,
            rm_muscleups=block_data.rm_muscleups,
            rm_squats=block_data.rm_squats,
            strategy=block_data.strategy,
            weekly_increment=block_data.weekly_increment,
            deload_week=block_data.deload_week,
            routines_by_day=block_data.routines_by_day,
            increment_type=block_data.increment_type,
            training_maxes=block_data.training_maxes,
            auto_progression=block_data.auto_progression,
            # Campos específicos de estrategias
            volume_multiplier=block_data.volume_multiplier,
            intensity_focus=block_data.intensity_focus,
            daily_variation=block_data.daily_variation,
            intensity_range=block_data.intensity_range,
            volume_cycles=block_data.volume_cycles,
            max_effort_days=block_data.max_effort_days,
            dynamic_effort_days=block_data.dynamic_effort_days,
            repetition_effort_days=block_data.repetition_effort_days,
            wave_pattern=block_data.wave_pattern,
            wave_amplitude=block_data.wave_amplitude,
            wave_frequency=block_data.wave_frequency,
            max_reps=block_data.max_reps,
            status='planned'
        )
        
        db.add(db_block)
        db.flush()  # Get the ID without committing
        
        # Generate stages based on strategy
        TrainingBlockService._generate_strategy_stages(db, db_block, block_data)
        
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def get_training_blocks(db: Session, user_id: int) -> List[TrainingBlock]:
        """Get all training blocks for a user"""
        return db.query(TrainingBlock).filter(TrainingBlock.user_id == user_id).all()
    
    @staticmethod
    def get_training_block(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Get a specific training block"""
        return db.query(TrainingBlock).filter(
            and_(TrainingBlock.id == block_id, TrainingBlock.user_id == user_id)
        ).first()
    
    @staticmethod
    def get_current_active_block(db: Session, user_id: int) -> Optional[TrainingBlock]:
        """Get the currently active training block for a user"""
        return db.query(TrainingBlock).filter(
            and_(TrainingBlock.user_id == user_id, TrainingBlock.is_active == True)
        ).first()
    
    @staticmethod
    def update_training_block(db: Session, block_id: int, user_id: int, block_data: TrainingBlockUpdate) -> Optional[TrainingBlock]:
        """Update a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        # Update only provided fields
        update_data = block_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_block, field, value)
        
        db_block.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def delete_training_block(db: Session, block_id: int, user_id: int) -> bool:
        """Delete a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return False
        
        db.delete(db_block)
        db.commit()
        return True
    
    @staticmethod
    def activate_training_block(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Activate a training block (deactivate others)"""
        # Deactivate all other blocks for this user
        db.query(TrainingBlock).filter(
            and_(TrainingBlock.user_id == user_id, TrainingBlock.id != block_id)
        ).update({"is_active": False})
        
        # Activate the specified block
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        db_block.is_active = True
        db_block.status = 'in_progress'
        db_block.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_block)
        return db_block
    
    @staticmethod
    def get_block_progress(db: Session, block_id: int, user_id: int) -> Optional[BlockProgress]:
        """Get progress information for a training block"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        # Calculate progress percentage
        progress_percentage = (db_block.current_week / db_block.total_weeks) * 100
        
        # Generate weekly projections
        weekly_projections = TrainingBlockService._generate_weekly_projections(db_block)
        
        # Generate RPE tables
        rpe_tables = TrainingBlockService._generate_rpe_tables(db_block)
        
        return BlockProgress(
            current_week=db_block.current_week,
            total_weeks=db_block.total_weeks,
            progress_percentage=progress_percentage,
            next_workout=None,  # TODO: Calculate based on routines_by_day
            weekly_projections=weekly_projections,
            rpe_tables=rpe_tables
        )
    
    @staticmethod
    def _generate_weekly_projections(block: TrainingBlock) -> Dict[str, Dict[str, float]]:
        """Generate weekly weight projections for the block"""
        projections = {}
        
        exercises = {
            'pullups': block.rm_pullups,
            'dips': block.rm_dips,
            'muscleups': block.rm_muscleups,
            'squats': block.rm_squats
        }
        
        # Get strategy parameters
        strategy_params = {
            'duration': block.duration,
            'weekly_increment': block.weekly_increment,
            'increment_type': block.increment_type,
            'deload_week': block.deload_week,
            'volume_multiplier': block.volume_multiplier,
            'intensity_focus': block.intensity_focus,
            'daily_variation': block.daily_variation,
            'intensity_range': block.intensity_range,
            'volume_cycles': block.volume_cycles,
            'max_effort_days': block.max_effort_days,
            'dynamic_effort_days': block.dynamic_effort_days,
            'repetition_effort_days': block.repetition_effort_days,
            'wave_pattern': block.wave_pattern,
            'wave_amplitude': block.wave_amplitude,
            'wave_frequency': block.wave_frequency
        }
        
        # For now, we'll use 0 as body weight since it's not stored in the block
        # In the future, this could come from user profile
        body_weight = 0
        
        for week in range(1, block.total_weeks + 1):
            week_key = f"week_{week}"
            projections[week_key] = {}
            
            for exercise, base_weight in exercises.items():
                if base_weight > 0:
                    # Calculate progression using the training calculator
                    progression = TrainingCalculatorService.calculate_weekly_progression(
                        base_weight, block.strategy, week, strategy_params, body_weight
                    )
                    
                    # Extract working weight
                    working_weight = progression['working_weight']
                    if isinstance(working_weight, str) and '-' in working_weight:
                        # For ranges, take the average
                        min_weight, max_weight = map(float, working_weight.split('-'))
                        working_weight = (min_weight + max_weight) / 2
                    
                    # For bodyweight exercises, the working weight is the base weight
                    # The user will add their body weight during training
                    projections[week_key][exercise] = round(working_weight, 1)
                else:
                    projections[week_key][exercise] = 0.0
        
        return projections
    
    @staticmethod
    def _generate_rpe_tables(block: TrainingBlock) -> Dict[str, Dict[str, List[float]]]:
        """Generate RPE tables for different exercises"""
        rpe_tables = {}
        
        exercises = {
            'pullups': block.rm_pullups,
            'dips': block.rm_dips,
            'muscleups': block.rm_muscleups,
            'squats': block.rm_squats
        }
        
        for exercise, base_rm in exercises.items():
            if base_rm > 0:
                # Use the training calculator to generate RPE table
                rpe_tables[exercise] = TrainingCalculatorService.get_rpe_table(base_rm)
            else:
                rpe_tables[exercise] = {}
        
        return rpe_tables
    
    @staticmethod
    def advance_week(db: Session, block_id: int, user_id: int) -> Optional[TrainingBlock]:
        """Advance the training block to the next week"""
        db_block = TrainingBlockService.get_training_block(db, block_id, user_id)
        if not db_block:
            return None
        
        if db_block.current_week < db_block.total_weeks:
            db_block.current_week += 1
            
            # Check if block is completed
            if db_block.current_week >= db_block.total_weeks:
                db_block.status = 'completed'
                db_block.is_active = False
            
            db_block.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_block)
        
        return db_block

    @staticmethod
    def _generate_strategy_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages based on the selected strategy"""
        
        if block_data.strategy == 'linear_progression':
            TrainingBlockService._generate_linear_progression_stages(db, block, block_data)
        elif block_data.strategy == 'block_periodization':
            TrainingBlockService._generate_block_periodization_stages(db, block, block_data)
        elif block_data.strategy == 'dub_progression':
            TrainingBlockService._generate_dup_stages(db, block, block_data)
        elif block_data.strategy == 'conjugate':
            TrainingBlockService._generate_conjugate_stages(db, block, block_data)
        elif block_data.strategy == 'wave_loading':
            TrainingBlockService._generate_wave_loading_stages(db, block, block_data)
        else:
            # Default stages
            TrainingBlockService._generate_default_stages(db, block, block_data)

    @staticmethod
    def _generate_linear_progression_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages for linear progression strategy"""
        
        for week in range(1, block_data.duration + 1):
            # Calculate load percentage based on week
            if week <= 4:
                load_percentage = 70 + (week - 1) * 5  # 70%, 75%, 80%, 85%
                phase = "Preparación"
            elif week <= 8:
                load_percentage = 85 + (week - 5) * 2.5  # 87.5%, 90%, 92.5%, 95%
                phase = "Construcción"
            else:
                load_percentage = 95 + (week - 9) * 1  # 96%, 97%, 98%, 99%
                phase = "Intensificación"
            
            # Check if this is a deload week
            is_deload = block_data.deload_week == week
            if is_deload:
                load_percentage = 60
                phase = "Descarga"
            
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - {phase}",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=0.5 if is_deload else 1.0,
                intensity_focus="recovery" if is_deload else "strength",
                description=f"Progresión lineal semana {week}. {phase} con {load_percentage}% de carga."
            )
            db.add(stage)

    @staticmethod
    def _generate_block_periodization_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages for block periodization strategy"""
        
        total_weeks = block_data.duration
        weeks_per_phase = total_weeks // 3
        
        # Phase 1: Accumulation (Volume)
        for week in range(1, weeks_per_phase + 1):
            load_percentage = 70 + (week - 1) * 2  # 70% to 78%
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - Acumulación",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=block_data.volume_multiplier or 1.5,
                intensity_focus="volume",
                description=f"Fase de acumulación. Volumen alto con {load_percentage}% de carga."
            )
            db.add(stage)
        
        # Phase 2: Intensification
        for week in range(weeks_per_phase + 1, weeks_per_phase * 2 + 1):
            load_percentage = 80 + (week - weeks_per_phase - 1) * 3  # 80% to 89%
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - Intensificación",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=1.0,
                intensity_focus="intensity",
                description=f"Fase de intensificación. Carga alta con {load_percentage}% de intensidad."
            )
            db.add(stage)
        
        # Phase 3: Realization
        for week in range(weeks_per_phase * 2 + 1, total_weeks + 1):
            load_percentage = 90 + (week - weeks_per_phase * 2 - 1) * 2  # 90% to 96%
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - Realización",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=0.8,
                intensity_focus="peak",
                description=f"Fase de realización. Pico de rendimiento con {load_percentage}% de carga."
            )
            db.add(stage)

    @staticmethod
    def _generate_dup_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages for DUP (Daily Undulating Periodization) strategy"""
        
        for week in range(1, block_data.duration + 1):
            # DUP varies daily, so each week has a base load that varies by day
            base_load = 75 + (week - 1) * 2  # Progressive base load
            
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - DUP",
                week_number=week,
                load_percentage=base_load,
                volume_multiplier=1.0,
                intensity_focus="undulating",
                description=f"DUP semana {week}. Carga base {base_load}% con variación diaria de intensidad y volumen."
            )
            db.add(stage)

    @staticmethod
    def _generate_conjugate_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages for conjugate method strategy"""
        
        for week in range(1, block_data.duration + 1):
            # Conjugate method maintains high intensity throughout
            load_percentage = 90 + (week - 1) * 1  # 90% to 95%
            
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - Conjugado",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=1.0,
                intensity_focus="max_strength",
                description=f"Método conjugado semana {week}. Esfuerzo máximo, dinámico y por repeticiones con {load_percentage}% de carga."
            )
            db.add(stage)

    @staticmethod
    def _generate_wave_loading_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate stages for wave loading strategy"""
        
        wave_pattern = getattr(block_data, 'wave_pattern', 'ascending')
        wave_amplitude = getattr(block_data, 'wave_amplitude', 10)
        wave_frequency = getattr(block_data, 'wave_frequency', 'weekly')
        
        for week in range(1, block_data.duration + 1):
            # Calculate wave pattern
            if wave_pattern == 'ascending':
                load_percentage = 70 + (week - 1) * 3 + (week % 3) * wave_amplitude
            elif wave_pattern == 'descending':
                load_percentage = 95 - (week - 1) * 2 - (week % 3) * wave_amplitude
            elif wave_pattern == 'pyramid':
                mid_week = block_data.duration // 2
                if week <= mid_week:
                    load_percentage = 70 + (week - 1) * 5
                else:
                    load_percentage = 95 - (week - mid_week - 1) * 5
            else:  # undulating
                load_percentage = 80 + (week % 2) * wave_amplitude
            
            # Ensure load percentage is within reasonable bounds
            load_percentage = max(60, min(95, load_percentage))
            
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week} - Ondas",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=1.0,
                intensity_focus="wave",
                description=f"Carga en ondas semana {week}. Patrón {wave_pattern} con {load_percentage}% de carga."
            )
            db.add(stage)

    @staticmethod
    def _generate_default_stages(db: Session, block: TrainingBlock, block_data: TrainingBlockCreate):
        """Generate default stages for unknown strategies"""
        
        for week in range(1, block_data.duration + 1):
            load_percentage = 70 + (week / block_data.duration) * 25  # 70% to 95%
            
            stage = BlockStage(
                block_id=block.id,
                name=f"Semana {week}",
                week_number=week,
                load_percentage=load_percentage,
                volume_multiplier=1.0,
                intensity_focus="general",
                description=f"Entrenamiento general semana {week} con {load_percentage}% de carga."
            )
            db.add(stage) 