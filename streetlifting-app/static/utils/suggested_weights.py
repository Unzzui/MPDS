import json
from datetime import datetime
from static.utils.constants import PREDEFINED_ROUTINES, MAIN_LIFTS
from routes.projections import generate_rpe_table
from datetime import date, timedelta

TRAINING_BLOCKS_FILE = "static/utils/training_blocks.json"
WORKOUTS_FILE = "static/utils/workouts.json"


def load_json(file_path):
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"blocks": []}


def get_last_workout_data():
    """Obtiene los datos del último entrenamiento registrado."""
    workouts_data = load_json(WORKOUTS_FILE)
    return workouts_data["workouts"][-1] if workouts_data["workouts"] else None


def get_current_block():
    """Obtiene el bloque actual desde el JSON."""
    blocks_data = load_json(TRAINING_BLOCKS_FILE)
    return blocks_data["blocks"][-1] if blocks_data["blocks"] else None


def calculate_current_week(start_date):
    today = date.today()  # Fecha actual

    # Incluir el día inicial como parte de la Semana 1
    days_diff = (today - start_date).days + 1

    if days_diff > 0:
        return (days_diff - 1) // 7 + 1  # Asegurarse de que el inicio sea la Semana 1
    else:
        return 0  # El bloque aún no ha comenzado


def suggest_weights(MAIN_LIFTS, current_block, current_week):
    """
    Genera los pesos sugeridos para los main lifts basándose en el bloque actual y la semana actual.

    Args:
        MAIN_LIFTS (list): Lista de main lifts.
        current_block (dict): Datos del bloque actual.
        current_week (int): Semana actual del bloque.

    Returns:
        dict: Pesos sugeridos para cada main lift con categorías "3x3", "3x5", y "3x8".
    """
    if not current_block or current_week <= 0:
        return {}

    # Obtener los RM iniciales de los main lifts
    MAIN_LIFTS_MAPPING = {
        "Pull-Up": "rm_pullups",
        "Weighted Dips": "rm_dips",
        "Muscle-Up": "rm_muscleups",
        "Squat": "rm_squats",
    }

    initial_rms = {
        lift: current_block.get(MAIN_LIFTS_MAPPING.get(lift, ""), 0)
        for lift in MAIN_LIFTS
    }

    weekly_increment = current_block.get("weekly_increment", 0)
    increment_type = current_block.get("increment_type", "percentage")

    # Generar la tabla de RPE
    suggested_weights = {}
    for lift, initial_rm in initial_rms.items():
        if not initial_rm:  # Si no hay RM definido, omitir este ejercicio
            continue

        rpe_table = generate_rpe_table(initial_rm)
        progression_data = {}

        # Calcular pesos para 3x3, 3x5, y 3x8
        for reps, label in zip([3, 5, 8], ["3x3", "3x5", "3x8"]):
            weight = rpe_table[f"RPE 8"][reps - 1]  # Siempre usamos RPE 8

            # Ajustar según el incremento semanal
            if increment_type == "percentage":
                weight *= 1 + (weekly_increment / 100) * (current_week - 1)
            elif increment_type == "absolute":
                weight += weekly_increment * (current_week - 1)

            progression_data[label] = round(weight, 2)

        suggested_weights[lift] = progression_data

    return suggested_weights
