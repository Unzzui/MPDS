from flask import Blueprint, jsonify, request, render_template
from datetime import date, timedelta
from static.utils.data_manager import load_json, save_json
from static.utils.file_initializer import INITIAL_STRUCTURES
import calendar
from datetime import datetime, date, timedelta

# Definir el Blueprint para el calendario
calendar_bp = Blueprint("calendar", __name__)

# Nombre del archivo JSON
WORKOUTS_FILE = "workouts"
TRAINING_BLOCKS_FILE = "training_blocks"


def get_calendar_data(year, month):
    """Genera los datos para mostrar un calendario basado en los entrenamientos y bloques activos."""
    workouts_data = load_json(WORKOUTS_FILE)
    workouts = workouts_data.get("workouts", [])

    # Cargar bloques desde el archivo JSON
    blocks_data = load_json(TRAINING_BLOCKS_FILE)
    today = date.today()

    # Actualizar el estado de los bloques
    for block in blocks_data["blocks"]:
        block_end_date = datetime.strptime(block["end_date"], "%Y-%m-%d").date()
        if today > block_end_date:
            block["status"] = "completed"
        elif block["status"] != "completed":
            block["status"] = "in_progress"

    # Guardar el estado actualizado
    save_json(TRAINING_BLOCKS_FILE, blocks_data)

    # Obtener el bloque activo (si existe)
    active_block = next(
        (block for block in blocks_data["blocks"] if block["status"] == "in_progress"),
        None,
    )
    routines_by_day = active_block.get("routines_by_day", {}) if active_block else {}
    print(f"Rutinas por día: {routines_by_day}")  # Depuración
    # Mapear fechas de entrenamientos registrados
    workout_map = {
        workout["date"]: workout for workout in workouts if workout.get("date")
    }

    # Generar semanas del mes
    first_day, total_days = calendar.monthrange(year, month)
    days = []

    block_end_date = (
        datetime.strptime(active_block["end_date"], "%Y-%m-%d").date()
        if active_block
        else None
    )

    for day in range(1, total_days + 1):
        current_date = date(year, month, day)
        formatted_date = current_date.strftime("%Y-%m-%d")
        weekday = current_date.weekday()

        if formatted_date in workout_map:
            workout = workout_map[formatted_date]
            days.append(
                {
                    "day": day,
                    "status": "completed",
                    "type": workout.get("day_type", ""),
                    "workout_id": workout.get("id"),
                }
            )
        elif active_block and current_date <= block_end_date:
            if current_date == block_end_date:
                days.append(
                    {
                        "day": day,
                        "status": "block_end",
                        "type": "Fin del Bloque",
                        "workout_id": None,
                    }
                )
            else:
                routine = routines_by_day.get(str(weekday), "Rest")
                days.append(
                    {
                        "day": day,
                        "status": "upcoming",
                        "type": routine,
                        "workout_id": None,
                    }
                )
        else:
            days.append(
                {
                    "day": day,
                    "status": "upcoming",
                    "type": "No definido",
                    "workout_id": None,
                }
            )

    # Agregar días vacíos al inicio y al final
    while len(days) % 7 != 0:
        days.append({"day": None, "status": "inactive", "type": ""})

    return days


# Endpoint para obtener datos del calendario
@calendar_bp.route("/calendar-data", methods=["GET"])
def calendar_data():
    """Endpoint para devolver datos del calendario en formato JSON."""
    try:
        year = request.args.get("year", type=int)
        month = request.args.get("month", type=int)

        # Validar parámetros
        if year is None or month is None:
            return (
                jsonify(
                    {"error": "Se requieren parámetros válidos de 'year' y 'month'."}
                ),
                400,
            )

        if month < 1 or month > 12:
            return (
                jsonify({"error": "Mes fuera de rango (debe ser entre 1 y 12)."}),
                400,
            )

        # Generar datos del calendario
        print(f"Generando calendario para {year}-{month}")  # Depuración
        data = get_calendar_data(year, month)

        # Validar salida de datos
        if not isinstance(data, list):
            return jsonify({"error": "Los datos generados no son válidos."}), 500

        return jsonify(data)
    except Exception as e:
        print(f"Error en calendar_data: {e}")  # Log del error para depuración
        return jsonify({"error": str(e)}), 500


@calendar_bp.route("/calendar")
def calendar_page():
    """Renderiza la página del calendario."""
    return render_template("calendar_page.html")
