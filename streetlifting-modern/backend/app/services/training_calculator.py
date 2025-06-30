"""
Training Calculator Service

This service calculates training loads, reps, and RPE based on 1RM values
and training methodology.
"""

from typing import Dict, List, Any, Optional
import math


class TrainingCalculatorService:
    
    @staticmethod
    def calculate_training_max(one_rm: float) -> float:
        """Calculate training max (usually 90% of 1RM)"""
        return one_rm * 0.9
    
    @staticmethod
    def calculate_working_weight(one_rm: float, percentage: float) -> float:
        """Calculate working weight based on percentage of 1RM"""
        return one_rm * (percentage / 100)
    
    @staticmethod
    def calculate_reps_for_weight(one_rm: float, weight: float) -> int:
        """Calculate estimated reps possible for a given weight"""
        if weight >= one_rm:
            return 1
        elif weight <= 0:
            return 0
        
        # Brzycki formula: weight = 1RM / (1 + reps/30)
        # Solving for reps: reps = 30 * (1RM/weight - 1)
        reps = 30 * (one_rm / weight - 1)
        return max(1, min(20, round(reps)))
    
    @staticmethod
    def calculate_weight_for_reps(one_rm: float, target_reps: int) -> float:
        """Calculate weight needed for target reps"""
        if target_reps <= 1:
            return one_rm
        
        # Brzycki formula: weight = 1RM / (1 + reps/30)
        weight = one_rm / (1 + target_reps / 30)
        return round(weight, 1)
    
    @staticmethod
    def calculate_total_weight_for_bodyweight_exercise(base_weight: float, body_weight: float = 0) -> float:
        """Calculate total weight for bodyweight exercises (base weight + body weight)"""
        return base_weight + body_weight
    
    @staticmethod
    def get_rpe_table(one_rm: float) -> Dict[str, List[float]]:
        """Generate RPE table for an exercise"""
        rpe_table = {}
        
        for rpe in range(6, 11):  # RPE 6-10
            rpe_key = f"RPE_{rpe}"
            rpe_table[rpe_key] = []
            
            # Calculate weights for different rep ranges
            for reps in [1, 3, 5, 8, 10, 12, 15]:
                if reps == 1:
                    # For 1 rep, RPE 10 = 100% 1RM, RPE 9 = 95%, etc.
                    percentage = 100 - (10 - rpe) * 5
                else:
                    # For multiple reps, adjust based on RPE
                    base_weight = TrainingCalculatorService.calculate_weight_for_reps(one_rm, reps)
                    rpe_adjustment = (10 - rpe) * 0.02  # 2% per RPE level
                    percentage = (base_weight / one_rm) * (1 - rpe_adjustment) * 100
                
                weight = TrainingCalculatorService.calculate_working_weight(one_rm, percentage)
                rpe_table[rpe_key].append(round(weight, 1))
        
        return rpe_table
    
    @staticmethod
    def calculate_weekly_progression(
        one_rm: float, 
        strategy: str, 
        week: int, 
        strategy_params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate weekly progression based on strategy"""
        
        if strategy == 'linear_progression':
            return TrainingCalculatorService._calculate_linear_progression(
                one_rm, week, strategy_params, body_weight
            )
        elif strategy == 'block_periodization':
            return TrainingCalculatorService._calculate_block_periodization(
                one_rm, week, strategy_params, body_weight
            )
        elif strategy == 'dub_progression':
            return TrainingCalculatorService._calculate_dup_progression(
                one_rm, week, strategy_params, body_weight
            )
        elif strategy == 'conjugate':
            return TrainingCalculatorService._calculate_conjugate_progression(
                one_rm, week, strategy_params, body_weight
            )
        elif strategy == 'wave_loading':
            return TrainingCalculatorService._calculate_wave_loading(
                one_rm, week, strategy_params, body_weight
            )
        else:
            return TrainingCalculatorService._calculate_default_progression(
                one_rm, week, body_weight
            )
    
    @staticmethod
    def _calculate_linear_progression(
        one_rm: float, 
        week: int, 
        params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate linear progression loads"""
        
        increment = params.get('weekly_increment', 2.5)
        increment_type = params.get('increment_type', 'absolute')
        deload_week = params.get('deload_week')
        
        # Check if this is a deload week
        if deload_week and week == deload_week:
            base_weight = TrainingCalculatorService.calculate_working_weight(one_rm, 60)
            total_weight = base_weight + body_weight
            
            return {
                'load_percentage': 60,
                'working_weight': round(total_weight, 1),
                'base_weight': round(base_weight, 1),
                'body_weight': round(body_weight, 1),
                'reps_range': [8, 12],
                'sets': 3,
                'rpe': 6,
                'notes': 'Semana de descarga - intensidad reducida'
            }
        
        # Calculate progression
        if increment_type == 'percentage':
            current_percentage = 70 + (week - 1) * increment
        else:
            # Absolute increment in kg
            base_weight = one_rm * 0.7  # Start at 70%
            current_weight = base_weight + (week - 1) * increment
            current_percentage = (current_weight / one_rm) * 100
        
        # Cap at 95% to avoid overtraining
        current_percentage = min(95, current_percentage)
        
        base_weight = TrainingCalculatorService.calculate_working_weight(one_rm, current_percentage)
        total_weight = base_weight + body_weight
        estimated_reps = TrainingCalculatorService.calculate_reps_for_weight(one_rm, base_weight)
        
        return {
            'load_percentage': round(current_percentage, 1),
            'working_weight': round(total_weight, 1),
            'base_weight': round(base_weight, 1),
            'body_weight': round(body_weight, 1),
            'reps_range': [max(1, estimated_reps - 2), estimated_reps],
            'sets': 3,
            'rpe': 8,
            'notes': f'Progresión lineal semana {week}'
        }
    
    @staticmethod
    def _calculate_block_periodization(
        one_rm: float, 
        week: int, 
        params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate block periodization loads"""
        
        total_weeks = params.get('duration', 12)
        weeks_per_phase = total_weeks // 3
        volume_multiplier = params.get('volume_multiplier', 1.0)
        
        # Determine phase
        if week <= weeks_per_phase:
            # Accumulation phase
            load_percentage = 70 + (week - 1) * 2
            reps_range = [8, 12]
            sets = int(4 * volume_multiplier)
            rpe = 7
            phase = 'Acumulación'
        elif week <= weeks_per_phase * 2:
            # Intensification phase
            load_percentage = 80 + (week - weeks_per_phase - 1) * 3
            reps_range = [5, 8]
            sets = 4
            rpe = 8
            phase = 'Intensificación'
        else:
            # Realization phase
            load_percentage = 90 + (week - weeks_per_phase * 2 - 1) * 2
            reps_range = [1, 5]
            sets = 3
            rpe = 9
            phase = 'Realización'
        
        working_weight = TrainingCalculatorService.calculate_working_weight(one_rm, load_percentage)
        
        return {
            'load_percentage': round(load_percentage, 1),
            'working_weight': round(working_weight, 1),
            'reps_range': reps_range,
            'sets': sets,
            'rpe': rpe,
            'notes': f'Periodización en bloques - {phase}'
        }
    
    @staticmethod
    def _calculate_dup_progression(
        one_rm: float, 
        week: int, 
        params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate DUP progression loads"""
        
        base_load = 75 + (week - 1) * 2
        daily_variation = params.get('daily_variation', 'intensity')
        
        # DUP varies daily, so we provide ranges
        if daily_variation == 'intensity':
            load_range = [base_load - 5, base_load + 5]
            reps_range = [3, 8]
        elif daily_variation == 'volume':
            load_range = [base_load - 10, base_load]
            reps_range = [8, 15]
        else:  # both
            load_range = [base_load - 10, base_load + 5]
            reps_range = [3, 15]
        
        working_weight_min = TrainingCalculatorService.calculate_working_weight(one_rm, load_range[0])
        working_weight_max = TrainingCalculatorService.calculate_working_weight(one_rm, load_range[1])
        
        return {
            'load_percentage': f"{load_range[0]}-{load_range[1]}",
            'working_weight': f"{round(working_weight_min, 1)}-{round(working_weight_max, 1)}",
            'reps_range': reps_range,
            'sets': 4,
            'rpe': 8,
            'notes': f'DUP semana {week} - variación diaria'
        }
    
    @staticmethod
    def _calculate_conjugate_progression(
        one_rm: float, 
        week: int, 
        params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate conjugate method loads"""
        
        # Conjugate maintains high intensity
        load_percentage = 90 + (week - 1) * 1
        load_percentage = min(95, load_percentage)
        
        working_weight = TrainingCalculatorService.calculate_working_weight(one_rm, load_percentage)
        
        return {
            'load_percentage': round(load_percentage, 1),
            'working_weight': round(working_weight, 1),
            'reps_range': [1, 3],
            'sets': 3,
            'rpe': 9,
            'notes': f'Método conjugado semana {week} - esfuerzo máximo'
        }
    
    @staticmethod
    def _calculate_wave_loading(
        one_rm: float, 
        week: int, 
        params: Dict[str, Any],
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate wave loading progression"""
        
        wave_pattern = params.get('wave_pattern', 'ascending')
        wave_amplitude = params.get('wave_amplitude', 10)
        
        # Calculate wave pattern
        if wave_pattern == 'ascending':
            load_percentage = 70 + (week - 1) * 3 + (week % 3) * wave_amplitude
        elif wave_pattern == 'descending':
            load_percentage = 95 - (week - 1) * 2 - (week % 3) * wave_amplitude
        elif wave_pattern == 'pyramid':
            mid_week = params.get('duration', 12) // 2
            if week <= mid_week:
                load_percentage = 70 + (week - 1) * 5
            else:
                load_percentage = 95 - (week - mid_week - 1) * 5
        else:  # undulating
            load_percentage = 80 + (week % 2) * wave_amplitude
        
        # Ensure load percentage is within reasonable bounds
        load_percentage = max(60, min(95, load_percentage))
        
        working_weight = TrainingCalculatorService.calculate_working_weight(one_rm, load_percentage)
        estimated_reps = TrainingCalculatorService.calculate_reps_for_weight(one_rm, working_weight)
        
        return {
            'load_percentage': round(load_percentage, 1),
            'working_weight': round(working_weight, 1),
            'reps_range': [max(1, estimated_reps - 2), estimated_reps],
            'sets': 4,
            'rpe': 8,
            'notes': f'Carga en ondas semana {week} - patrón {wave_pattern}'
        }
    
    @staticmethod
    def _calculate_default_progression(
        one_rm: float, 
        week: int,
        body_weight: float = 0
    ) -> Dict[str, Any]:
        """Calculate default progression"""
        
        load_percentage = 70 + (week / 12) * 25  # 70% to 95%
        working_weight = TrainingCalculatorService.calculate_working_weight(one_rm, load_percentage)
        estimated_reps = TrainingCalculatorService.calculate_reps_for_weight(one_rm, working_weight)
        
        return {
            'load_percentage': round(load_percentage, 1),
            'working_weight': round(working_weight, 1),
            'reps_range': [max(1, estimated_reps - 2), estimated_reps],
            'sets': 3,
            'rpe': 8,
            'notes': f'Entrenamiento general semana {week}'
        } 