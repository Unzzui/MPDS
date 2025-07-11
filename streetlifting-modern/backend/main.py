from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.core.base import Base
from app.core.init_admin import create_admin_user
from app.core.init_routines import create_example_routines
from app.api.v1.auth import router as auth_router
from app.api.v1.workouts import router as workouts_router
from app.api.v1.blocks import router as blocks_router
from app.api.v1.routines import router as routines_router
from app.api.v1.one_rep_maxes import router as one_rep_maxes_router
from app.api.v1.user_adaptation import router as user_adaptation_router
from app.api.v1.setup import router as setup_router
from app.api.v1.program_templates import router as program_templates_router
from app.api.v1.user_profile import router as user_profile_router

# Import all models to ensure tables are created
from app.models import User, Workout, Exercise, TrainingBlock, BlockStage, OneRepMax, Routine, RoutineExercise, UserProfile, UserInteraction, DashboardConfiguration
from app.models.training import TrainingProgram, PlannedWorkout, ExerciseTemplate

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="StreetLifting API",
    description="A modern workout tracking API for streetlifting",
    version="1.0.0"
)

# Add CORS middleware with broader access for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(workouts_router, prefix="/api/v1/workouts", tags=["workouts"])
app.include_router(blocks_router, prefix="/api/v1/blocks", tags=["blocks"])
app.include_router(routines_router, prefix="/api/v1/routines", tags=["routines"])
app.include_router(one_rep_maxes_router, prefix="/api/v1/one-rep-maxes", tags=["one-rep-maxes"])
app.include_router(user_adaptation_router, prefix="/api/v1/adaptation", tags=["user-adaptation"])
app.include_router(setup_router, prefix="/api/v1/setup", tags=["setup"])
app.include_router(program_templates_router, prefix="/api/v1/programs", tags=["program-templates"])
app.include_router(user_profile_router, prefix="/api/v1/user-profile", tags=["user-profile"])

@app.on_event("startup")
async def startup_event():
    """Create admin user and example routines on startup"""
    create_admin_user()
    create_example_routines()

@app.get("/")
async def root():
    return {"message": "StreetLifting API is running! 🏋️"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running normally"}

@app.get("/test-one-rep-maxes")
async def test_one_rep_maxes():
    """Test endpoint for one-rep-maxes without authentication"""
    return {"message": "One-rep-maxes endpoint is accessible", "data": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 