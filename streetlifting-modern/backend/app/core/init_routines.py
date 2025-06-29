"""
Routine initialization module
"""
from app.core.database import SessionLocal
from app.models.routine import Routine
from app.services.routine import RoutineService
from app.schemas.routine import RoutineCreate

def create_example_routines():
    """Create example routines if they don't exist"""
    db = SessionLocal()
    try:
        # Check if routines already exist
        existing_routines = db.query(Routine).filter(Routine.is_template == True).count()
        if existing_routines > 0:
            print("ℹ️  Example routines already exist")
            return
        
        # Example routines based on the original app
        example_routines = [
            {
                "name": "Primary Pull",
                "description": "Rutina principal de tracción para desarrollo de fuerza",
                "exercises": [
                    "Pull-Up",
                    "Gironda Row", 
                    "Unilateral Pulldown",
                    "Barbell Curl (EZ Bar)",
                    "Wrist Curl",
                    "Hammer Curl"
                ],
                "days": [1],
                "main_lifts": ["Pull-Up"],
                "is_template": True
            },
            {
                "name": "Primary Squat",
                "description": "Rutina principal de sentadillas para desarrollo de piernas",
                "exercises": [
                    "Squat",
                    "Leg Curl",
                    "Leg Extension", 
                    "Hip Adduction"
                ],
                "days": [2],
                "main_lifts": ["Squat"],
                "is_template": True
            },
            {
                "name": "Primary Dips",
                "description": "Rutina principal de fondos para desarrollo de empuje",
                "exercises": [
                    "Weighted Dips",
                    "Military Press",
                    "Unilateral Triceps Extension",
                    "Flat Bench Press"
                ],
                "days": [3],
                "main_lifts": ["Weighted Dips"],
                "is_template": True
            },
            {
                "name": "Secondary Pull",
                "description": "Rutina secundaria de tracción para volumen adicional",
                "exercises": [
                    "Muscle-Up",
                    "Pin Pull-Up",
                    "Gironda Row",
                    "Unilateral Pulldown",
                    "Barbell Curl (EZ Bar)",
                    "Wrist Curl",
                    "Hammer Curl"
                ],
                "days": [4],
                "main_lifts": ["Pull-Up"],
                "is_template": True
            },
            {
                "name": "Secondary Dips",
                "description": "Rutina secundaria de fondos para volumen adicional",
                "exercises": [
                    "Weighted Dips",
                    "Military Press",
                    "Unilateral Triceps Extension",
                    "Flat Bench Press",
                    "Incline Bench Press",
                    "Lateral Raises"
                ],
                "days": [5],
                "main_lifts": ["Weighted Dips"],
                "is_template": True
            }
        ]
        
        # Create routines
        for routine_data in example_routines:
            try:
                routine_create = RoutineCreate(**routine_data)
                RoutineService.create_routine(db, 1, routine_create)  # Admin user ID
                print(f"✅ Created routine: {routine_data['name']}")
            except Exception as e:
                print(f"❌ Error creating routine {routine_data['name']}: {e}")
        
        print("✅ Example routines created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating example routines: {e}")
        db.rollback()
    finally:
        db.close() 