from extensions import db  # Importamos db desde extensions.py
from datetime import datetime, date


# Modelos de la base de datos
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=datetime.utcnow)
    day_type = db.Column(db.String(50), nullable=False)
    success = db.Column(db.Boolean, nullable=False, default=True)


class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey("workout.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    rpe = db.Column(db.Float, nullable=True)
    notes = db.Column(db.String(200), nullable=True)
    completed = db.Column(db.Boolean, default=True)


class OneRepMax(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exercise = db.Column(db.String(100), nullable=False, unique=True)
    one_rm = db.Column(db.Float, nullable=False)


class TrainingBlock(db.Model):
    __tablename__ = "training_blocks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    total_weeks = db.Column(db.Integer, nullable=False)
    current_stage = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    current_week = db.Column(db.Integer, nullable=False, default=1)
    rm_pullups = db.Column(db.Float, nullable=False, default=0.0)
    rm_dips = db.Column(db.Float, nullable=False, default=0.0)
    rm_muscleups = db.Column(db.Float, nullable=False, default=0.0)
    rm_squats = db.Column(db.Float, nullable=False, default=0.0)
    strategy = db.Column(db.String(50), nullable=False, default="default")
    weekly_increment = db.Column(db.Float, nullable=False, default=3.0)
    deload_week = db.Column(db.Integer, nullable=True)

    # Relación con User
    user = db.relationship("User", back_populates="training_blocks")

    # Relación con BlockStage
    stages = db.relationship(
        "BlockStage", back_populates="block", cascade="all, delete-orphan"
    )


class BlockStage(db.Model):
    __tablename__ = "block_stage"
    id = db.Column(db.Integer, primary_key=True)
    block_id = db.Column(
        db.Integer, db.ForeignKey("training_blocks.id"), nullable=False
    )
    block = db.relationship(
        "TrainingBlock", back_populates="stages"
    )  # Relación con TrainingBlock
    name = db.Column(db.String(50), nullable=False)
    week_number = db.Column(db.Integer, nullable=False)
    load_percentage = db.Column(db.Float, nullable=False)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)

    # Relación con TrainingBlock
    training_blocks = db.relationship(
        "TrainingBlock", back_populates="user", cascade="all, delete-orphan"
    )
