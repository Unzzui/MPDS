"""
Training program templates for Streetlifting

This module contains predefined training program templates with complete
methodologies, progression schemes, and workout structures.
"""

from typing import Dict, List, Any
from enum import Enum


class MethodologyType(str, Enum):
    LINEAR_PROGRESSION = "linear_progression"
    FIVE_THREE_ONE = "531"
    CONJUGATE = "conjugate"
    BLOCK_PERIODIZATION = "block_periodization"
    DAILY_UNDULATING = "daily_undulating"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


STREETLIFTING_PROGRAM_TEMPLATES = {
    "beginner_linear": {
        "name": "Beginner Linear Progression",
        "description": "Simple linear progression perfect for beginners. Focus on the basic movements with consistent weekly increases.",
        "methodology": MethodologyType.LINEAR_PROGRESSION,
        "duration_weeks": 12,
        "difficulty_level": DifficultyLevel.BEGINNER,
        "main_lifts": ["pullups", "dips", "muscle_ups", "squats"],
        "frequency_per_week": 3,
        "program_structure": {
            "weeks_1_8": {
                "description": "Linear progression phase",
                "load_percentage": 85,
                "volume_multiplier": 1.0,
                "increment_per_week": 2.5
            },
            "weeks_9_10": {
                "description": "Intensity phase",
                "load_percentage": 92,
                "volume_multiplier": 0.8,
                "increment_per_week": 1.25
            },
            "weeks_11_12": {
                "description": "Peak and test",
                "load_percentage": 100,
                "volume_multiplier": 0.6,
                "increment_per_week": 0
            }
        },
        "intensity_zones": {
            "light": {"min": 65, "max": 75},
            "moderate": {"min": 80, "max": 85},
            "heavy": {"min": 90, "max": 95},
            "max": {"min": 100, "max": 105}
        },
        "weekly_structure": {
            "day_1": {
                "name": "Upper Body Strength",
                "focus": "upper",
                "exercises": [
                    {
                        "name": "pullups",
                        "category": "main_lift",
                        "sets": 5,
                        "reps": 5,
                        "intensity": 85,
                        "rest_seconds": 180
                    },
                    {
                        "name": "dips",
                        "category": "main_lift", 
                        "sets": 5,
                        "reps": 5,
                        "intensity": 85,
                        "rest_seconds": 180
                    },
                    {
                        "name": "muscle_ups",
                        "category": "skill",
                        "sets": 3,
                        "reps": 3,
                        "intensity": 75,
                        "rest_seconds": 240
                    },
                    {
                        "name": "push_ups",
                        "category": "accessory",
                        "sets": 3,
                        "reps": 12,
                        "intensity": "bodyweight",
                        "rest_seconds": 90
                    }
                ]
            },
            "day_2": {
                "name": "Lower Body & Core",
                "focus": "lower",
                "exercises": [
                    {
                        "name": "squats",
                        "category": "main_lift",
                        "sets": 5,
                        "reps": 5,
                        "intensity": 85,
                        "rest_seconds": 180
                    },
                    {
                        "name": "pistol_squats",
                        "category": "main_lift",
                        "sets": 4,
                        "reps": 6,
                        "intensity": "bodyweight",
                        "rest_seconds": 120
                    },
                    {
                        "name": "hanging_leg_raises",
                        "category": "core",
                        "sets": 4,
                        "reps": 10,
                        "intensity": "bodyweight",
                        "rest_seconds": 90
                    },
                    {
                        "name": "lunges",
                        "category": "accessory",
                        "sets": 3,
                        "reps": 12,
                        "intensity": "bodyweight",
                        "rest_seconds": 90
                    }
                ]
            },
            "day_3": {
                "name": "Full Body Power",
                "focus": "full",
                "exercises": [
                    {
                        "name": "explosive_pullups",
                        "category": "power",
                        "sets": 5,
                        "reps": 3,
                        "intensity": 70,
                        "rest_seconds": 180
                    },
                    {
                        "name": "explosive_dips",
                        "category": "power",
                        "sets": 5,
                        "reps": 3,
                        "intensity": 70,
                        "rest_seconds": 180
                    },
                    {
                        "name": "jump_squats",
                        "category": "power",
                        "sets": 4,
                        "reps": 8,
                        "intensity": "bodyweight",
                        "rest_seconds": 120
                    },
                    {
                        "name": "burpees",
                        "category": "conditioning",
                        "sets": 3,
                        "reps": 10,
                        "intensity": "bodyweight",
                        "rest_seconds": 90
                    }
                ]
            }
        }
    },
    
    "intermediate_531": {
        "name": "5/3/1 for Streetlifting",
        "description": "Jim Wendler's 5/3/1 adapted for streetlifting movements. Perfect for intermediate athletes.",
        "methodology": MethodologyType.FIVE_THREE_ONE,
        "duration_weeks": 16,
        "difficulty_level": DifficultyLevel.INTERMEDIATE,
        "main_lifts": ["pullups", "dips", "muscle_ups", "squats"],
        "frequency_per_week": 4,
        "program_structure": {
            "cycle_1": {
                "weeks": [1, 2, 3, 4],
                "description": "Base building cycle",
                "deload_week": 4
            },
            "cycle_2": {
                "weeks": [5, 6, 7, 8],
                "description": "Strength development",
                "deload_week": 8
            },
            "cycle_3": {
                "weeks": [9, 10, 11, 12],
                "description": "Intensity phase",
                "deload_week": 12
            },
            "cycle_4": {
                "weeks": [13, 14, 15, 16],
                "description": "Peak and test",
                "deload_week": 16
            }
        },
        "intensity_zones": {
            "week_1": {"sets": [5, 5, 5], "percentages": [65, 75, 85]},
            "week_2": {"sets": [3, 3, 3], "percentages": [70, 80, 90]},
            "week_3": {"sets": [5, 3, 1], "percentages": [75, 85, 95]},
            "week_4": {"sets": [5, 5, 5], "percentages": [40, 50, 60]}  # Deload
        },
        "weekly_structure": {
            "day_1": {
                "name": "Pullups + Accessories",
                "focus": "pull",
                "main_lift": "pullups",
                "accessories": ["rows", "lat_pulldowns", "bicep_curls"]
            },
            "day_2": {
                "name": "Squats + Lower Body",
                "focus": "lower",
                "main_lift": "squats",
                "accessories": ["lunges", "calf_raises", "leg_curls"]
            },
            "day_3": {
                "name": "Dips + Push",
                "focus": "push",
                "main_lift": "dips",
                "accessories": ["push_ups", "shoulder_press", "tricep_extensions"]
            },
            "day_4": {
                "name": "Muscle Ups + Power",
                "focus": "power",
                "main_lift": "muscle_ups",
                "accessories": ["explosive_pullups", "explosive_dips", "plyometrics"]
            }
        }
    },
    
    "advanced_conjugate": {
        "name": "Conjugate Method for Streetlifting",
        "description": "Westside Barbell conjugate method adapted for streetlifting. For advanced athletes only.",
        "methodology": MethodologyType.CONJUGATE,
        "duration_weeks": 20,
        "difficulty_level": DifficultyLevel.ADVANCED,
        "main_lifts": ["pullups", "dips", "muscle_ups", "squats"],
        "frequency_per_week": 4,
        "program_structure": {
            "max_effort_upper": {
                "frequency": "weekly",
                "description": "Work up to 1-3RM in variation",
                "intensity": "100%+"
            },
            "dynamic_effort_upper": {
                "frequency": "weekly",
                "description": "Speed work with bands/chains",
                "intensity": "50-60% + accommodating resistance"
            },
            "max_effort_lower": {
                "frequency": "weekly", 
                "description": "Work up to 1-3RM in variation",
                "intensity": "100%+"
            },
            "dynamic_effort_lower": {
                "frequency": "weekly",
                "description": "Speed squats and jumps",
                "intensity": "50-60% for 3 weeks, deload on 4th"
            }
        },
        "intensity_zones": {
            "max_effort": {"min": 100, "max": 110},
            "dynamic_effort": {"min": 50, "max": 60},
            "repetition_method": {"min": 70, "max": 85}
        },
        "weekly_structure": {
            "day_1": {
                "name": "Max Effort Upper",
                "focus": "max_strength_upper",
                "structure": "max_effort"
            },
            "day_2": {
                "name": "Max Effort Lower", 
                "focus": "max_strength_lower",
                "structure": "max_effort"
            },
            "day_3": {
                "name": "Dynamic Effort Upper",
                "focus": "speed_upper",
                "structure": "dynamic_effort"
            },
            "day_4": {
                "name": "Dynamic Effort Lower",
                "focus": "speed_lower", 
                "structure": "dynamic_effort"
            }
        }
    },
    
    "intermediate_block": {
        "name": "Block Periodization",
        "description": "Modern block periodization approach with distinct training phases.",
        "methodology": MethodologyType.BLOCK_PERIODIZATION,
        "duration_weeks": 18,
        "difficulty_level": DifficultyLevel.INTERMEDIATE,
        "main_lifts": ["pullups", "dips", "muscle_ups", "squats"],
        "frequency_per_week": 4,
        "program_structure": {
            "accumulation_block": {
                "weeks": [1, 2, 3, 4, 5, 6],
                "description": "High volume, moderate intensity",
                "focus": "hypertrophy",
                "load_percentage": 75,
                "volume_multiplier": 1.3
            },
            "intensification_block": {
                "weeks": [7, 8, 9, 10, 11, 12],
                "description": "Moderate volume, high intensity",
                "focus": "strength",
                "load_percentage": 90,
                "volume_multiplier": 0.8
            },
            "realization_block": {
                "weeks": [13, 14, 15, 16, 17, 18],
                "description": "Low volume, peak intensity",
                "focus": "peaking",
                "load_percentage": 100,
                "volume_multiplier": 0.5
            }
        },
        "intensity_zones": {
            "accumulation": {"min": 70, "max": 80},
            "intensification": {"min": 85, "max": 95},
            "realization": {"min": 95, "max": 105}
        }
    }
}


def get_template_by_name(template_name: str) -> Dict[str, Any]:
    """Get a specific program template by name"""
    return STREETLIFTING_PROGRAM_TEMPLATES.get(template_name)


def get_templates_by_level(level: DifficultyLevel) -> List[Dict[str, Any]]:
    """Get all templates for a specific difficulty level"""
    return [
        {**template, "template_key": key}
        for key, template in STREETLIFTING_PROGRAM_TEMPLATES.items()
        if template["difficulty_level"] == level
    ]


def get_all_templates() -> Dict[str, Dict[str, Any]]:
    """Get all available templates"""
    return STREETLIFTING_PROGRAM_TEMPLATES


def calculate_training_max(one_rm: float, percentage: float = 90.0) -> float:
    """Calculate training max from 1RM (default 90%)"""
    return round(one_rm * (percentage / 100), 1)


def calculate_working_weight(training_max: float, percentage: float) -> float:
    """Calculate working weight from training max and percentage"""
    return round(training_max * (percentage / 100), 1)
