from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import date, datetime
from datetime import date as datetime_date
from datetime import date, datetime
from flask import send_from_directory
import calendar
from sqlalchemy.sql import extract
from flask import jsonify
from datetime import date, timedelta
from flask import Flask, render_template
from flask import flash
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
import json
import os
import uuid
from pathlib import Path

# Configuración de la aplicación
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///streetlifting.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Ruta del archivo JSON
DATA_FILE = "./utils/data_rm.json"
DATABASE_PATH = "./utils/data_rm.json"
# Cargar datos de JSON o inicializar estructura si el archivo no existe, tambien agregar la estructura de la base de datos
# Verificar si el archivo existe
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r+") as file:
        try:
            database = json.load(file)
        except json.JSONDecodeError:
            database = {}

        # Verificar y actualizar la estructura
        updated = False
        if "initial_data" not in database:
            database["initial_data"] = {}
            updated = True
        if "rm_records" not in database:
            database["rm_records"] = []
            updated = True

        if updated:
            # Reescribir el archivo con la estructura actualizada
            file.seek(0)
            json.dump(database, file, indent=4)
            file.truncate()
else:
    database = {"initial_data": {}, "rm_records": []}
    with open(DATA_FILE, "w") as file:
        json.dump(database, file, indent=4)


# Función para cargar datos del archivo JSON
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    else:
        return {"rm_records": []}


# Función para guardar datos en el archivo JSON
def save_data(data):
    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)


# Base de datos inicial cargada desde el archivo JSON
rm_data = load_data()
DEFAULT_USER_ID = 1  # Reemplaza esto con un ID válido en tu base de datos
app.secret_key = "clave_super_secreta"


@app.route("/utils/<path:filename>")
def serve_utils(filename):
    return send_from_directory("utils", filename)


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
    user = db.relationship("User", back_populates="training_blocks")
    name = db.Column(db.String(100), default="Bloque de Fuerza")
    duration = db.Column(db.Integer, nullable=False)
    current_stage = db.Column(db.String(20), default="Carga")
    start_date = db.Column(db.Date, nullable=False)
    current_week = db.Column(db.Integer, default=1)
    total_weeks = db.Column(db.Integer, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    rm_pullups = db.Column(db.Float, nullable=False, default=0.0)
    rm_dips = db.Column(db.Float, nullable=False, default=0.0)
    rm_muscleups = db.Column(db.Float, nullable=False, default=0.0)
    rm_squats = db.Column(db.Float, nullable=False, default=0.0)
    strategy = db.Column(db.String(50), default="default")
    weekly_increment = db.Column(db.Float, default=3.0)
    deload_week = db.Column(db.Integer, default=None)

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
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    training_blocks = db.relationship(
        "TrainingBlock", back_populates="user", cascade="all, delete-orphan"
    )


# Rutinas predefinidas
PREDEFINED_ROUTINES = {
    "Primary Pull": [
        "Pull-Up",
        "Gironda Row",
        "Unilateral Pulldown",
        "Barbell Curl (EZ Bar)",
        "Wrist Curl",
        "Hammer Curl",
    ],
    "Secondary Pull": [
        "Pull-Up",
        "Gironda Row",
        "Unilateral Pulldown",
        "Barbell Curl (EZ Bar)",
        "Wrist Curl",
        "Hammer Curl",
    ],
    "Primary Squat": ["Back Squat", "Leg Curl", "Leg Extension"],
    "Primary Dips": [
        "Weighted Dips",
        "Military Press",
        "Unilateral Triceps Extension",
        "Flat Bench Press",
    ],
    "Secondary Dips": [
        "Weighted Dips",
        "Military Press",
        "Unilateral Triceps Extension",
        "Flat Bench Press",
        "Incline Bench Press",
        "Lateral Raises",
    ],
}

DAY_TO_ROUTINE = {
    0: "Rest",
    1: "Primary Pull",
    2: "Primary Squat",
    3: "Primary Dips",
    4: "Secondary Pull",
    5: "Secondary Dips",
    6: "Rest",
}

WORKOUTS_FILE = "utils/workouts.json"

# Verificar y actualizar la estructura del archivo workouts.json
if os.path.exists(WORKOUTS_FILE):
    with open(WORKOUTS_FILE, "r+") as file:
        try:
            database = json.load(file)
        except json.JSONDecodeError:
            database = {}

        # Verificar y actualizar la estructura
        updated = False
        if "workouts" not in database:
            database["workouts"] = []  # Crear lista de entrenamientos si no existe
            updated = True

        if updated:
            # Reescribir el archivo con la estructura actualizada
            file.seek(0)
            json.dump(database, file, indent=4)
            file.truncate()
else:
    # Crear el archivo con la estructura inicial
    database = {"workouts": []}
    with open(WORKOUTS_FILE, "w") as file:
        json.dump(database, file, indent=4)


# Función para cargar datos del archivo JSON
def load_workouts():
    if os.path.exists(WORKOUTS_FILE):
        with open(WORKOUTS_FILE, "r") as file:
            return json.load(file)
    else:
        return {"workouts": []}


# Función para guardar datos en el archivo JSON
def save_workouts(workouts_data):
    with open(WORKOUTS_FILE, "w") as file:
        json.dump(workouts_data, file, indent=4)


def get_current_stage(block):
    stages = {
        "Acumulación": range(1, 4),
        "Intensidad": range(4, 6),
        "Descarga": range(6, 7),
    }
    for stage, weeks in stages.items():
        if block.current_week in weeks:
            return stage
    return "Finalizado"


def advance_week(block):
    if block.current_week < block.total_weeks:
        block.current_week += 1
        block.current_stage = get_current_stage(block)
        db.session.commit()
    else:
        block.current_stage = "Finalizado"
        db.session.commit()


def normalize_exercise_name(name):
    return name.strip().lower()


def calculate_estimated_one_rm(weight, reps):
    if reps > 1:
        return round(weight * (1 + 0.0333 * reps), 2)
    return round(weight, 2)


@app.context_processor
def utility_processor():
    return dict(calculate_one_rm=calculate_estimated_one_rm)


def calculate_next_weight(current_weight, success, adjustment=0.03, regression=0.05):
    """Calcula el peso para la próxima sesión basado en éxito o fallo."""
    if success:
        return round(current_weight * (1 + adjustment), 1)  # Incremento normal
    else:
        return round(current_weight * (1 - regression), 1)  # Retroceso


@app.route("/", methods=["GET", "POST"])
def index():
    EXERCISE_NAME_MAP = {
        "pull_up_rm": "Pull-Up",
        "dip_rm": "Weighted Dips",
        "squat_rm": "Back Squat",
        "muscle_up_rm": "Muscle-ups",
    }

    today = date.today().weekday()
    today_routine = DAY_TO_ROUTINE.get(today, "Rest")

    if request.method == "POST":
        action = request.form["action"]
        if action == "log_workout":
            day_type = request.form.get("day_type", today_routine)
            return redirect(url_for("log_workout", day_type=day_type))
        elif action == "view_progress":
            return redirect(url_for("view_progress"))
        elif action == "view_history":
            return redirect(url_for("history"))
        elif action == "setup":
            return redirect(url_for("setup"))

    # Recuperar 1RM registrado desde la base de datos
    one_rm = {entry.exercise: entry.one_rm for entry in OneRepMax.query.all()}

    # Recuperar datos iniciales desde el JSON
    with open("utils/data_rm.json", "r") as f:
        data = json.load(f)
    initial_data = data.get("initial_data", {})
    rm_records = data.get("workouts", [])

    # Agregar datos iniciales al 1RM registrado (si no están en la base de datos)
    for json_key, exercise_name in EXERCISE_NAME_MAP.items():
        initial_value = initial_data.get(json_key)
        if exercise_name not in one_rm and initial_value is not None:
            one_rm[exercise_name] = initial_value

    # Inicializar el diccionario para el 1RM hipotético
    hypothetical_one_rm = {exercise: one_rm.get(exercise, 0) for exercise in one_rm}

    # Procesar cada registro de entrenamiento en el JSON
    for workout in rm_records:
        for exercise in workout["exercises"]:
            exercise_name = exercise["name"]
            weight = exercise["weight"]
            reps = exercise["reps"]

            # Calcular el nuevo 1RM estimado
            estimated_one_rm = calculate_estimated_one_rm(weight=weight, reps=reps)

            # Comparar y actualizar el 1RM hipotético si corresponde
            if exercise_name in hypothetical_one_rm:
                hypothetical_one_rm[exercise_name] = max(
                    hypothetical_one_rm[exercise_name],
                    one_rm.get(exercise_name, 0),
                    estimated_one_rm,
                )
                print(
                    f"Updated hypothetical 1RM for {exercise_name}: {hypothetical_one_rm[exercise_name]}"
                )

    # Completar ejercicios no registrados
    for exercise in one_rm.keys():
        if exercise not in hypothetical_one_rm:
            hypothetical_one_rm[exercise] = "Aún no se registra"

    # Recuperar el bloque actual
    block = TrainingBlock.query.order_by(TrainingBlock.start_date.desc()).first()
    block_data = (
        {
            "current_stage": block.current_stage,
            "current_week": block.current_week,
            "total_weeks": block.total_weeks,
        }
        if block
        else None
    )

    return render_template(
        "index.html",
        today_routine=today_routine,
        routines=list(PREDEFINED_ROUTINES.keys()),
        one_rm=one_rm,
        hypothetical_one_rm=hypothetical_one_rm,
        block=block_data,
    )


@app.route("/setup", methods=["GET", "POST"])
def setup():
    if request.method == "POST":
        # Recopilar datos iniciales
        date = request.form.get("date", datetime.now().strftime("%Y-%m-%d"))
        pull_up_rm = request.form.get("pull_up_rm")
        dip_rm = request.form.get("dip_rm")
        squat_rm = request.form.get("squat_rm")
        muscle_up_rm = request.form.get("muscle_up_rm")

        # Actualizar initial_data
        database["initial_data"] = {
            "date": date,
            "pull_up_rm": float(pull_up_rm) if pull_up_rm else None,
            "dip_rm": float(dip_rm) if dip_rm else None,
            "squat_rm": float(squat_rm) if squat_rm else None,
            "muscle_up_rm": float(muscle_up_rm) if muscle_up_rm else None,
        }

        # Agregar los datos iniciales también a rm_records
        database["rm_records"].append(database["initial_data"])

        # Guardar cambios en el JSON
        with open("utils/data_rm.json", "w") as file:
            json.dump(database, file, indent=4)

        return redirect(url_for("progress"))
    return render_template("setup.html")


def update_workout_in_json(workout_id, updated_workout):
    with open("utils/workouts.json", "r") as f:
        data = json.load(f)
    for i, workout in enumerate(data["workouts"]):
        if workout["id"] == workout_id:
            data["workouts"][i] = updated_workout
            break
    with open("utils/workouts.json", "w") as f:
        json.dump(data, f, indent=4)


def delete_workout_from_json(workout_id):
    with open("utils/workouts.json", "r") as f:
        data = json.load(f)
    data["workouts"] = [w for w in data["workouts"] if w["id"] != workout_id]
    with open("utils/workouts.json", "w") as f:
        json.dump(data, f, indent=4)


@app.route("/update_rm", methods=["GET", "POST"])
def update_rm():
    if request.method == "POST":
        # Obtener los datos del formulario
        date = request.form["date"]
        pull_up_rm = request.form.get("pull_up_rm")
        dip_rm = request.form.get("dip_rm")
        squat_rm = request.form.get("squat_rm")
        muscle_up_rm = request.form.get("muscle_up_rm")

        # Crear el nuevo registro
        new_record = {
            "date": date,
            "pull_up_rm": float(pull_up_rm) if pull_up_rm else None,
            "dip_rm": float(dip_rm) if dip_rm else None,
            "squat_rm": float(squat_rm) if squat_rm else None,
            "muscle_up_rm": float(muscle_up_rm) if muscle_up_rm else None,
        }

        # Añadir el nuevo registro al diccionario `database`
        database["rm_records"].append(new_record)

        # Guardar los cambios en el archivo JSON
        with open("./utils/data_rm.json", "w") as file:
            json.dump(database, file, indent=4)

        # Redirigir al progreso
        return redirect(url_for("progress"))

    # Mostrar la plantilla de actualización
    today_date = datetime.now().strftime("%Y-%m-%d")
    return render_template("update_rm.html", today_date=today_date)


import json
import calendar
from datetime import datetime

WORKOUTS_JSON_PATH = "utils/workouts.json"


@app.route("/history", methods=["GET", "POST"])
def history():
    # Cargar los datos desde el JSON
    try:
        with open(WORKOUTS_JSON_PATH, "r") as f:
            data = json.load(f)
            workouts = data.get("workouts", [])
    except (FileNotFoundError, json.JSONDecodeError):
        workouts = []

    # Obtener año y mes de los parámetros GET
    selected_year = request.args.get("year", datetime.now().year)
    selected_month = request.args.get("month", "")

    # Lista de años y meses para el selector
    years = sorted(
        set(datetime.strptime(w["date"], "%Y-%m-%d").year for w in workouts),
        reverse=True,
    )
    months = [{"name": calendar.month_name[i], "value": i} for i in range(1, 13)]

    # Filtrar entrenamientos por año y mes
    filtered_workouts = [
        w
        for w in workouts
        if datetime.strptime(w["date"], "%Y-%m-%d").year == int(selected_year)
        and (
            not selected_month
            or datetime.strptime(w["date"], "%Y-%m-%d").month == int(selected_month)
        )
    ]

    # Ordenar los entrenamientos por fecha descendente
    filtered_workouts = sorted(
        filtered_workouts,
        key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"),
        reverse=True,
    )

    return render_template(
        "history.html",
        workouts=filtered_workouts,
        years=years,
        months=months,
        selected_year=selected_year,
        selected_month=selected_month,
    )


def get_percentage_for_reps(reps):
    """Devuelve el porcentaje del 1RM para las repeticiones objetivo."""
    rep_to_percentage = {1: 1.00, 3: 0.93, 5: 0.87, 8: 0.80, 10: 0.75}
    return rep_to_percentage.get(reps, 0.70)  # Default: 70% para 12+ reps


def calculate_weight_for_reps(one_rm, reps):
    """Calcula el peso sugerido basado en el 1RM y repeticiones objetivo."""
    percentage = get_percentage_for_reps(reps)
    return round(one_rm * percentage, 1)


def get_last_session_weight(exercise_name):
    """Obtiene el peso de la última sesión para el ejercicio dado."""
    last_exercise = (
        Exercise.query.filter_by(name=exercise_name)
        .order_by(Exercise.id.desc())
        .first()
    )
    if last_exercise:
        return last_exercise.weight, last_exercise.completed
    return None, None


from datetime import date, datetime  # Aseguramos la importación correcta

WORKOUTS_JSON_PATH = "utils/workouts.json"


# Función para cargar datos desde el JSON
def load_workouts_from_json():
    try:
        with open(WORKOUTS_JSON_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"workouts": []}  # Estructura inicial si no existe el archivo


# Define la ruta del archivo JSON
WORKOUTS_JSON_PATH = "utils/workouts.json"


def save_workout_to_json(workout_data):
    json_path = "utils/data_rm.json"

    try:
        # Leer el contenido existente
        with open(json_path, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Si el archivo no existe o está malformado, inicializar con formato válido
        data = {"workouts": []}

    # Verificar si la clave "workouts" es una lista, si no, inicializarla
    if "workouts" not in data or not isinstance(data["workouts"], list):
        data["workouts"] = []

    # Agregar el nuevo entrenamiento al JSON
    data["workouts"].append(workout_data)

    # Guardar nuevamente en el archivo
    with open(json_path, "w") as f:
        json.dump(data, f, indent=4)


def normalize_json_file(path):
    try:
        with open(path, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    if not isinstance(data, dict):
        data = {"workouts": data if isinstance(data, list) else []}
    elif "workouts" not in data:
        data["workouts"] = []

    with open(path, "w") as f:
        json.dump(data, f, indent=4)


normalize_json_file("utils/workouts.json")


@app.route("/log/<day_type>", methods=["GET", "POST"])
def log_workout(day_type):
    from datetime import date as datetime_date

    workout_date = request.args.get("date", datetime_date.today().strftime("%Y-%m-%d"))
    reps_goal = int(request.args.get("reps", 3))

    # Recuperar el último entrenamiento para este tipo de día
    last_workout = (
        Workout.query.filter_by(day_type=day_type).order_by(Workout.date.desc()).first()
    )
    previous_summary = None

    if last_workout:
        exercises = Exercise.query.filter_by(workout_id=last_workout.id).all()
        previous_summary = {
            "date": last_workout.date.strftime("%Y-%m-%d"),
            "day_type": last_workout.day_type,
            "details": [
                {
                    "name": ex.name,
                    "weight": ex.weight,
                    "reps": ex.reps,
                    "completed": ex.completed,
                }
                for ex in exercises
            ],
        }

    suggested_weights = {}
    exercises = PREDEFINED_ROUTINES.get(day_type, [])
    main_lifts = ["Pull-Up", "Weighted Dips", "Back Squat"]

    for exercise in main_lifts:
        if exercise in exercises:
            one_rm_entry = OneRepMax.query.filter_by(exercise=exercise).first()
            one_rm = one_rm_entry.one_rm if one_rm_entry else 0
            last_exercise = (
                Exercise.query.filter_by(name=exercise)
                .order_by(Exercise.workout_id.desc())
                .first()
            )
            if last_exercise:
                if all(
                    e.completed
                    for e in Exercise.query.filter_by(
                        name=exercise, workout_id=last_exercise.workout_id
                    ).all()
                ):
                    fuerza = last_exercise.weight * (1 + 0.03)
                else:
                    fuerza = last_exercise.weight
            else:
                fuerza = one_rm * 0.80

            tecnica = fuerza - 10
            volumen = tecnica - 10

            suggested_weights[exercise] = {
                "Fuerza": round(fuerza, 1),
                "Técnica": round(tecnica, 1),
                "Volumen": round(volumen, 1),
            }

    if request.method == "POST":
        workout_date = request.form.get("date", workout_date)
        workout = Workout(
            date=datetime.strptime(workout_date, "%Y-%m-%d"), day_type=day_type
        )
        db.session.add(workout)
        db.session.commit()

        workout_data = {
            "date": workout_date,
            "day_type": day_type,
            "exercises": [],
        }

        for exercise in exercises:
            weights_list = request.form.getlist(f"weight_{exercise}[]")
            reps_list = request.form.getlist(f"reps_{exercise}[]")
            completed_list = request.form.getlist(f"completed_{exercise}[]")

            for i in range(len(weights_list)):
                if weights_list[i] and reps_list[i]:
                    exercise_entry = Exercise(
                        workout_id=workout.id,
                        name=exercise,
                        weight=float(weights_list[i]),
                        reps=int(reps_list[i]),
                        completed=(completed_list[i] == "true"),
                    )
                    db.session.add(exercise_entry)
                    workout_data["exercises"].append(
                        {
                            "name": exercise,
                            "weight": float(weights_list[i]),
                            "reps": int(reps_list[i]),
                            "completed": (completed_list[i] == "true"),
                        }
                    )
        db.session.commit()

        # Guardar en JSON
        save_workout_to_json(workout_data)

        return redirect(
            url_for("log_workout", day_type=day_type, date=workout_date, reps=reps_goal)
        )

    # Asegurarse de devolver una respuesta en todos los casos
    return render_template(
        "log_workout.html",
        day_type=day_type,
        reps_goal=reps_goal,
        today_date=workout_date,
        previous_summary=previous_summary,
        suggested_weights=suggested_weights,
        exercises=exercises,
    )


def get_workout_by_id(workout_id):
    with open("utils/workouts.json", "r") as f:
        data = json.load(f)
    for workout in data["workouts"]:
        if workout["id"] == workout_id:
            return workout
    return None

    return render_template(
        "log_workout.html",
        day_type=day_type,
        reps_goal=reps_goal,
        today_date=workout_date,
        previous_summary=previous_summary,
        suggested_weights=suggested_weights,
        exercises=exercises,
    )


@app.route("/progress")
def progress():
    # Cargar el archivo JSON
    with open("utils/data_rm.json", "r") as file:
        data = json.load(file)

    # Validar datos iniciales
    initial_data = data.get("initial_data", {})
    initial_data = {
        "date": initial_data.get("date", "Sin fecha"),
        "pull_up_rm": initial_data.get("pull_up_rm", 0),
        "dip_rm": initial_data.get("dip_rm", 0),
        "squat_rm": initial_data.get("squat_rm", 0),
        "muscle_up_rm": initial_data.get("muscle_up_rm", 0),
    }

    # Validar registros de RM
    rm_records = data.get("rm_records", [])
    for record in rm_records:
        record["date"] = record.get("date", "Sin fecha")
        record["pull_up_rm"] = record.get("pull_up_rm", 0)
        record["dip_rm"] = record.get("dip_rm", 0)
        record["squat_rm"] = record.get("squat_rm", 0)
        record["muscle_up_rm"] = record.get("muscle_up_rm", 0)

    # Ordenar registros por fecha
    records_sorted = sorted([initial_data] + rm_records, key=lambda x: x["date"])

    return render_template(
        "progress.html", initial_data=initial_data, records=records_sorted
    )


# Función para leer el JSON
def read_database():
    with open(DATABASE_PATH, "r") as file:
        return json.load(file)


# Función para escribir en el JSON
def write_database(data):
    with open(DATABASE_PATH, "w") as file:
        json.dump(data, file, indent=4)


@app.route("/records", methods=["GET", "POST"])
def manage_records():
    data = read_database()

    if request.method == "POST":
        # Obtener datos del formulario
        new_record = {
            "date": request.form["date"],
            "pull_up_rm": float(request.form["pull_up_rm"]),
            "dip_rm": float(request.form["dip_rm"]),
            "squat_rm": float(request.form["squat_rm"]),
            "muscle_up_rm": float(request.form["muscle_up_rm"]),
        }
        # Agregar el nuevo registro a "rm_records"
        data["rm_records"].append(new_record)
        # Guardar los cambios en el archivo JSON
        write_database(data)
        return redirect(url_for("manage_records"))

    return render_template("records.html", rm_data=data["rm_records"])


@app.route("/delete_record/<date>", methods=["POST"])
def delete_record(date):
    database["rm_records"] = [
        record for record in database["rm_records"] if record["date"] != date
    ]
    flash("Registro eliminado correctamente.", "success")
    return redirect(url_for("records"))


@app.route("/edit_record/<date>", methods=["POST"])
def edit_record(date):
    for record in database["rm_records"]:
        if record["date"] == date:
            record["pull_up_rm"] = float(request.form["pull_up_rm"])
            record["dip_rm"] = float(request.form["dip_rm"])
            record["squat_rm"] = float(request.form["squat_rm"])
            record["muscle_up_rm"] = float(request.form["muscle_up_rm"])
            flash("Registro actualizado correctamente.", "success")
            break
    return redirect(url_for("records"))


@app.route("/workout/<workout_id>", methods=["GET"])
def workout_detail(workout_id):
    workout = get_workout_by_id(workout_id)
    if not workout:
        return "Entrenamiento no encontrado", 404
    return render_template("workout_detail.html", workout=workout)


@app.route("/debug-data")
def debug_data():
    """Muestra todos los datos de la base de datos para inspección."""
    data = {"workouts": []}

    # Obtener todos los entrenamientos
    workouts = Workout.query.order_by(Workout.date.desc()).all()

    for workout in workouts:
        workout_data = {
            "workout_id": workout.id,
            "date": workout.date.strftime("%Y-%m-%d"),
            "day_type": workout.day_type,
            "success": workout.success,
            "exercises": [],
        }

        # Obtener los ejercicios asociados al entrenamiento
        exercises = Exercise.query.filter_by(workout_id=workout.id).all()
        for exercise in exercises:
            # Calcular el 1RM hipotético para este ejercicio
            estimated_one_rm = calculate_estimated_one_rm(
                weight=exercise.weight, reps=exercise.reps
            )
            workout_data["exercises"].append(
                {
                    "name": exercise.name,
                    "weight": exercise.weight,
                    "reps": exercise.reps,
                    "rpe": exercise.rpe,
                    "notes": exercise.notes,
                    "completed": exercise.completed,
                    "estimated_one_rm": estimated_one_rm,
                }
            )

        data["workouts"].append(workout_data)

    # Obtener datos de 1RM inicial registrado
    data["one_rm"] = {entry.exercise: entry.one_rm for entry in OneRepMax.query.all()}

    return data


@app.route("/edit_workout/<workout_id>", methods=["GET", "POST"])
def edit_workout(workout_id):
    workout = get_workout_by_id(workout_id)
    if not workout:
        return "Entrenamiento no encontrado", 404

    if request.method == "POST":
        # Actualizar datos desde el formulario
        workout["date"] = request.form["date"]
        workout["day_type"] = request.form["day_type"]
        # Actualizar ejercicios
        workout["exercises"] = [
            {
                "name": request.form.get(f"exercise_name_{i}"),
                "weight": float(request.form.get(f"weight_{i}")),
                "reps": int(request.form.get(f"reps_{i}")),
                "completed": request.form.get(f"completed_{i}") == "true",
            }
            for i in range(len(workout["exercises"]))
        ]
        update_workout_in_json(workout_id, workout)
        return redirect(url_for("history"))
    return render_template("edit_workout.html", workout=workout)


@app.route("/delete_workout/<workout_id>", methods=["POST"])
def delete_workout(workout_id):
    delete_workout_from_json(workout_id)
    return redirect(url_for("history"))

    try:
        with open("utils/workouts.json", "r") as f:
            data = json.load(f)

        data["workouts"] = [w for w in data["workouts"] if w["date"] != workout_date]

        with open("utils/workouts.json", "w") as f:
            json.dump(data, f, indent=4)

        return redirect(url_for("history"))
    except Exception as e:
        print(f"Error al eliminar el entrenamiento: {e}")
        return redirect(url_for("history"))


def get_calendar_data(year, month):
    # Obtén los entrenamientos registrados en el mes especificado
    workouts = Workout.query.filter(
        Workout.date.between(f"{year}-{month:02d}-01", f"{year}-{month:02d}-31")
    ).all()

    # Mapeo de fechas a entrenamientos
    workout_map = {workout.date: workout for workout in workouts}

    # Generar los datos del calendario
    days = []
    first_day = date(year, month, 1)
    start_day_of_week = first_day.weekday()  # 0 = Lunes, 6 = Domingo

    # Cálculo seguro del próximo mes
    if month == 12:
        next_month = 1
        next_year = year + 1
    else:
        next_month = month + 1
        next_year = year

    # Calcular el total de días del mes actual
    total_days = (date(next_year, next_month, 1) - timedelta(days=1)).day

    # Agregar días vacíos al inicio de la semana
    for _ in range(start_day_of_week):
        days.append({"day": None, "status": "inactive", "type": ""})

    # Agregar días del mes
    for day in range(1, total_days + 1):
        current_date = date(year, month, day)
        if current_date in workout_map:
            workout = workout_map[current_date]
            days.append(
                {
                    "day": day,
                    "status": "completed",
                    "type": workout.day_type,
                    "workout_id": workout.id,
                }
            )
        else:
            days.append(
                {"day": day, "status": "upcoming", "type": "", "workout_id": None}
            )

    # Agregar días vacíos al final de la semana
    while len(days) % 7 != 0:
        days.append({"day": None, "status": "inactive", "type": ""})

    return days


@app.route("/calendar-data")
def calendar_data():
    try:
        year = request.args.get("year", type=int)
        month = request.args.get("month", type=int)

        if not year or not month:
            return jsonify({"error": "Faltan parámetros de año o mes"}), 400

        if month < 1 or month > 12:
            return jsonify({"error": "Mes fuera de rango"}), 400

        data = get_calendar_data(year, month)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/select-workout-type", methods=["GET", "POST"])
def select_workout_type():
    # Capturar la fecha pasada como parámetro
    selected_date = request.args.get("date", None)

    if request.method == "POST":
        # Capturar el tipo de entrenamiento seleccionado
        day_type = request.form.get("day_type")
        if day_type:
            # Redirigir a la página de log_workout con la fecha y el tipo de entrenamiento
            return redirect(
                url_for("log_workout", day_type=day_type, date=selected_date)
            )

    # Obtener los tipos de entrenamiento de las rutinas predefinidas
    available_day_types = list(PREDEFINED_ROUTINES.keys())

    return render_template(
        "select_workout_type.html",
        selected_date=selected_date,
        available_day_types=available_day_types,
    )


@app.route("/define-block", methods=["GET", "POST"])
def define_block():
    if request.method == "POST":
        name = request.form.get("name")
        duration = int(request.form.get("duration"))
        stage = request.form.get("stage")
        start_date = datetime.strptime(request.form.get("start_date"), "%Y-%m-%d")

        # Determinar las semanas específicas
        if duration == 4:
            # Para bloques de 4 semanas: 3 semanas (volumen/carga) + 1 semana (prueba)
            structure = ["Volumen", "Volumen", "Carga", "Prueba"]
        elif duration == 7:
            # Para bloques de 7 semanas: 5 semanas (volumen/carga) + 1 descarga + 1 prueba
            structure = [
                "Volumen",
                "Volumen",
                "Carga",
                "Volumen",
                "Carga",
                "Descarga",
                "Prueba",
            ]
        else:
            return jsonify({"error": "Duración no soportada"}), 400

        # Crear y guardar el bloque
        block = TrainingBlock(
            user_id=DEFAULT_USER_ID,  # Cambiar según la autenticación de usuarios
            name=name,
            stage=stage,
            total_weeks=duration,
            current_week=1,
            start_date=start_date,
            end_date=start_date + timedelta(weeks=duration - 1),
        )
        db.session.add(block)
        db.session.commit()

        # Guardar la estructura del bloque
        for week_index, week_stage in enumerate(structure):
            block_stage = BlockStage(
                block_id=block.id,
                week=week_index + 1,
                stage=week_stage,
            )
            db.session.add(block_stage)
        db.session.commit()

        return redirect(url_for("index"))

    return render_template("define_block.html")


@app.route("/create-block", methods=["GET", "POST"])
def create_block():
    from datetime import datetime, timedelta

    if request.method == "POST":
        user_id = DEFAULT_USER_ID  # Ajustar según tu lógica de autenticación
        name = request.form.get("block_name", "Bloque de Fuerza")
        duration = int(request.form.get("block_duration"))
        start_date = datetime.strptime(
            request.form.get("start_date"), "%Y-%m-%d"
        ).date()
        end_date = start_date + timedelta(weeks=duration)

        # Recuperar los valores de RM iniciales
        rm_pullups = float(request.form.get("rm_pullups", 0))
        rm_dips = float(request.form.get("rm_dips", 0))
        rm_muscleups = float(request.form.get("rm_muscleups", 0))
        rm_squats = float(request.form.get("rm_squats", 0))

        # Estrategia
        strategy = request.form.get("strategy", "default")
        weekly_increment = float(request.form.get("weekly_increment", 3.0) or 3.0)
        deload_week = (
            int(request.form.get("deload_week", duration))
            if strategy == "custom"
            else None
        )

        # Crear el bloque en la base de datos
        new_block = TrainingBlock(
            user_id=user_id,
            name=name,
            duration=duration,
            total_weeks=duration,  # Asignar valor a total_weeks
            start_date=start_date,
            end_date=end_date,
            rm_pullups=rm_pullups,
            rm_dips=rm_dips,
            rm_muscleups=rm_muscleups,
            rm_squats=rm_squats,
            strategy=strategy,
            weekly_increment=weekly_increment,
            deload_week=deload_week,
        )
        db.session.add(new_block)
        db.session.commit()

        flash("Bloque creado con éxito.", "success")
        return redirect(url_for("index"))

    return render_template("create_block.html")


@app.route("/current-block", methods=["GET"])
def current_block():
    from datetime import datetime

    block = TrainingBlock.query.filter_by(user_id=DEFAULT_USER_ID).first()
    if not block:
        return jsonify({"error": "No hay bloques activos"}), 404

    today = datetime.now().date()
    days_elapsed = (today - block.start_date).days
    current_week = (days_elapsed // 7) + 1

    # Verificar si ya pasó la duración del bloque
    if current_week > block.duration:
        current_week = block.duration

    return jsonify(
        {
            "current_stage": block.strategy,
            "current_week": current_week,
            "total_weeks": block.duration,
            "rm_pullups": block.rm_pullups,
            "rm_dips": block.rm_dips,
            "rm_muscleups": block.rm_muscleups,
            "rm_squats": block.rm_squats,
        }
    )


@app.route("/block-detail", methods=["GET"])
def block_detail():
    # Obtener el bloque actual
    block = TrainingBlock.query.filter_by(user_id=DEFAULT_USER_ID).first()
    if not block:
        flash("No hay bloques activos.", "error")
        return redirect(url_for("index"))

    # Obtener las etapas asociadas al bloque
    stages = (
        BlockStage.query.filter_by(block_id=block.id)
        .order_by(BlockStage.week_number)
        .all()
    )

    # Preparar los datos para la plantilla
    block_data = {
        "name": block.name,
        "current_stage": block.current_stage,
        "current_week": block.current_week,
        "total_weeks": block.total_weeks,
        "start_date": block.start_date.strftime("%Y-%m-%d"),
        "end_date": block.end_date.strftime("%Y-%m-%d"),
        "strategy": block.strategy,
        "weekly_increment": block.weekly_increment,
        "deload_week": block.deload_week,
        "rm_pullups": block.rm_pullups,
        "rm_dips": block.rm_dips,
        "rm_muscleups": block.rm_muscleups,
        "rm_squats": block.rm_squats,
    }

    return render_template("block_detail.html", block=block_data, stages=stages)


@app.route("/delete-block", methods=["POST"])
def delete_block():
    block = TrainingBlock.query.filter_by(user_id=DEFAULT_USER_ID).first()
    if block:
        db.session.delete(block)
        db.session.commit()
        return jsonify({"success": "Bloque eliminado con éxito"}), 200
    return jsonify({"error": "No hay bloque para eliminar"}), 404


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
