from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.core.base import Base
from app.core.init_admin import create_admin_user
from app.core.init_routines import create_example_routines
from app.api.v1 import auth, workouts, blocks, routines, one_rep_maxes

# Import all models to ensure tables are created
from app.models import User, Workout, Exercise, TrainingBlock, BlockStage, OneRepMax, Routine, RoutineExercise

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
app.include_router(auth, prefix="/api/v1/auth", tags=["auth"])
app.include_router(workouts, prefix="/api/v1/workouts", tags=["workouts"])
app.include_router(blocks, prefix="/api/v1/blocks", tags=["blocks"])
app.include_router(routines, prefix="/api/v1/routines", tags=["routines"])
app.include_router(one_rep_maxes, prefix="/api/v1/one-rep-maxes", tags=["one-rep-maxes"])

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 