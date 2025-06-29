from flask import Blueprint, render_template, redirect, request, url_for
from datetime import date
from static.utils.data_manager import load_json
from static.utils.rm_calculator import calculate_hypothetical_rm
from static.utils.common import calculate_estimated_one_rm
from static.utils.constants import DAY_TO_ROUTINE, PREDEFINED_ROUTINES
import json
from datetime import datetime

# Crear el Blueprint
index_bp = Blueprint("index", __name__)

# Nombres de los archivos JSON
DATA_RM_FILE = "data_rm"
WORKOUTS_FILE = "workouts"
TRAINING_BLOCKS_FILE = "training_blocks"
USER_DATA_FILE = "static/utils/user_data.json"


# Mapeo de ejercicios
EXERCISE_NAME_MAP = {
    "pull_up_rm": "Pull-Up",
    "dip_rm": "Weighted Dips",
    "squat_rm": "Squat",
    "muscle_up_rm": "Muscle-ups",
}


def safe_int(value):
    """Convierte un valor a entero, manejando errores de forma segura."""
    try:
        return int(value)
    except (ValueError, TypeError):
        return value


@index_bp.route("/", methods=["GET", "POST"])
def index():
    """Ruta principal de la aplicación."""
    # Cargar datos del usuario
    user_data = load_user_data()

    # Si no hay datos de usuario válidos, redirigir a la configuración inicial
    if not user_data:
        return redirect(url_for("setup.setup"))

    # Obtener la rutina del día
    blocks_data = load_json(TRAINING_BLOCKS_FILE)
    active_block = blocks_data["blocks"][-1] if blocks_data["blocks"] else None
    if active_block:
        # Obtener la rutina del día desde el bloque activo
        today = date.today().weekday()  # Día de la semana (0=Lunes, 6=Domingo)
        routines_by_day = active_block.get("routines_by_day", {})
        today_routine = routines_by_day.get(str(today), "Rest")
    else:
        today_routine = "Sin bloque activo - Defina un bloque o registre entrenamientos"

    # Cargar datos iniciales y registros de entrenamiento
    data_rm = load_json(DATA_RM_FILE)
    workouts_data = load_json(WORKOUTS_FILE)

    # Obtener datos iniciales
    initial_data = data_rm.get("initial_data", {})
    rm_records = workouts_data.get("workouts", [])

    # Crear un diccionario con el 1RM inicial para cada ejercicio
    one_rm_initial = {
        exercise_name: safe_int(initial_data.get(json_key, 0))
        for json_key, exercise_name in EXERCISE_NAME_MAP.items()
    }

    # Calcular el 1RM hipotético basado en los entrenamientos
    one_rm_hypothetical = {
        exercise: "Aún no se registra" for exercise in one_rm_initial
    }

    for workout in rm_records:
        for exercise in workout.get("exercises", []):
            exercise_name = exercise.get("name")
            weight = exercise.get("weight", 0)
            reps = exercise.get("reps", 0)

            # Calcular el nuevo 1RM estimado
            estimated_one_rm = calculate_estimated_one_rm(weight, reps)

            # Comparar y actualizar el 1RM hipotético
            if (
                exercise_name in one_rm_hypothetical
                and estimated_one_rm > one_rm_initial.get(exercise_name, 0)
            ):
                if one_rm_hypothetical[exercise_name] == "Aún no se registra":
                    one_rm_hypothetical[exercise_name] = max(
                        estimated_one_rm, one_rm_initial.get(exercise_name, 0)
                    )
                else:
                    one_rm_hypothetical[exercise_name] = max(
                        one_rm_hypothetical[exercise_name], estimated_one_rm
                    )
    recent_workouts = []

    if "workouts" in workouts_data:
        # Ordenar entrenamientos por fecha (descendente) con manejo de errores
        sorted_workouts = sorted(
            [
                workout
                for workout in workouts_data["workouts"]
                if isinstance(
                    workout.get("date"), str
                )  # Asegurar que la fecha es válida
                and workout["date"]  # No vacía
            ],
            key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"),
            reverse=True,
        )
        # Seleccionar los 3 entrenamientos más recientes y extraer info del main lift
        for workout in sorted_workouts[:3]:
            main_lift = workout["exercises"][0] if workout["exercises"] else {}
            main_lift_set = main_lift["sets"][0] if main_lift.get("sets") else {}
            recent_workouts.append(
                {
                    "id": workout["id"],
                    "date": workout["date"],
                    "day_type": workout["day_type"],
                    "main_lift_name": main_lift.get("name", "N/A"),
                    "weight": main_lift_set.get("weight", 0),
                    "reps": main_lift_set.get("reps", 0),
                    "rpe": main_lift_set.get("rpe", "N/A"),
                }
            )

    # Datos para gráficos
    weekly_volume = {
        "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        "values": [500, 600, 700, 800],
    }

    one_rm_history = {
        "labels": ["Enero", "Febrero", "Marzo", "Abril"],
        "values": [50, 55, 60, 65],
    }

    # Validar y limpiar datos
    weekly_volume = {
        "labels": weekly_volume.get("labels", []),
        "values": weekly_volume.get("values", []),
    }
    one_rm_history = {
        "labels": one_rm_history.get("labels", []),
        "values": one_rm_history.get("values", []),
    }

    # Datos del usuario para el template
    user = {
        "name": user_data["name"],
        "age": user_data["age"],
        "weight": user_data["weight"],
        "height": user_data["height"],
    }

    return render_template(
        "general/index.html",
        user=user,
        today_routine=today_routine,
        one_rm_initial=one_rm_initial,
        one_rm_hypothetical={k: safe_int(v) for k, v in one_rm_hypothetical.items()},
        weekly_volume=weekly_volume,
        one_rm_history=one_rm_history,
        recent_workouts=recent_workouts,
    )


# Función auxiliar para cargar datos del usuario
def load_user_data():
    """Carga los datos del usuario desde el archivo JSON."""
    try:
        with open(USER_DATA_FILE, "r") as file:
            user_data = json.load(file)
            # Comprobar si el archivo contiene datos por defecto
            if not user_data.get("name") or user_data["age"] == 0:
                return None  # No hay datos válidos
            return user_data
    except (FileNotFoundError, json.JSONDecodeError):
        return None  # Archivo no encontrado o JSON inválido


def handle_post_request(today_routine):
    """Procesa los formularios enviados desde la página principal."""
    action = request.form.get("action")

    if action == "log_workout":
        day_type = request.form.get("day_type", today_routine)
        return redirect(url_for("workouts.log_workout", day_type=day_type))
    elif action == "view_progress":
        return redirect(url_for("records.progress"))
    elif action == "view_history":
        return redirect(url_for("history.view_history"))
    elif action == "setup":
        return redirect(url_for("setup.setup"))

    # Redirigir al índice si no coincide ninguna acción
    return redirect(url_for("index"))
