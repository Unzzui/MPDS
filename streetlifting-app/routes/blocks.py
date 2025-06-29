from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from datetime import datetime, timedelta
import uuid
import json
from .projections import (
    generate_rpe_table,
)
from datetime import datetime, date, timedelta

from .routines import load_routines

blocks_bp = Blueprint("blocks", __name__)

DEFAULT_USER_ID = 1
TRAINING_BLOCKS_FILE = "static/utils/training_blocks.json"


def load_json(file_path):
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"blocks": []}


def save_json(file_path, data):
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)


@blocks_bp.route("/create-block", methods=["GET", "POST"], endpoint="create_block")
def create_block():
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    # Filtrar el bloque activo (estado in_progress)
    current_block = next(
        (block for block in blocks_data["blocks"] if block["status"] == "in_progress"),
        None,
    )

    # Si no hay bloque activo y es una solicitud POST, crea un nuevo bloque
    if not current_block and request.method == "POST":
        block_id = str(uuid.uuid4())
        name = request.form["block_name"]
        duration = int(request.form["block_duration"])
        start_date = datetime.strptime(request.form["start_date"], "%Y-%m-%d").date()
        end_date = start_date + timedelta(weeks=duration) - timedelta(days=1)

        rm_pullups = float(request.form.get("rm_pullups", 0))
        rm_dips = float(request.form.get("rm_dips", 0))
        rm_muscleups = float(request.form.get("rm_muscleups", 0))
        rm_squats = float(request.form.get("rm_squats", 0))

        strategy = request.form.get("strategy", "default")
        increment_type = request.form.get("increment_type", "percentage")
        weekly_increment = float(request.form.get("weekly_increment", 5.0))
        deload_week = (
            int(request.form.get("deload_week", duration))
            if strategy == "custom"
            else None
        )

        # Obtener rutinas por día
        routines_by_day = {
            str(day): request.form.get(f"routines_by_day[{day}]", "Rest")
            for day in range(7)
        }

        new_block = {
            "id": block_id,
            "name": name,
            "duration": duration,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "rm_pullups": rm_pullups,
            "rm_dips": rm_dips,
            "rm_muscleups": rm_muscleups,
            "rm_squats": rm_squats,
            "strategy": strategy,
            "increment_type": increment_type,
            "weekly_increment": weekly_increment,
            "deload_week": deload_week,
            "routines_by_day": routines_by_day,
            "status": "in_progress",  # Estado inicial
        }

        # Guardar el nuevo bloque en el archivo JSON
        blocks_data["blocks"].append(new_block)
        save_json(TRAINING_BLOCKS_FILE, blocks_data)

        flash("Bloque creado con éxito.", "success")
        return redirect(url_for("blocks.create_block"))

    # Si hay un bloque activo, muestra su información
    if current_block:
        weekly_weights = calculate_weekly_weights_with_formula(current_block)
        rpe_tables = {
            "Pull-Ups": generate_rpe_table(current_block.get("rm_pullups", 50.0)),
            "Dips": generate_rpe_table(current_block.get("rm_dips", 50.0)),
            "Muscle-Ups": generate_rpe_table(current_block.get("rm_muscleups", 50.0)),
            "Squat": generate_rpe_table(current_block.get("rm_squats", 50.0)),
        }

        progression_by_reps = {}
        for lift, weekly_data in weekly_weights.items():
            progression_by_reps[lift] = {}
            for week_str, weight in weekly_data.items():
                progression_by_reps[lift][week_str] = weight

        return render_template(
            "blocks/current_block.html",
            block=current_block,
            weekly_projections=weekly_weights,
            rpe_tables=rpe_tables,
            progression_by_reps=progression_by_reps,
        )

    # Obtener las rutinas disponibles y mostrar el formulario
    routines = load_routines()
    return render_template(
        "blocks/create_block.html", routines=routines, enumerate=enumerate
    )


def calculate_weekly_weights_with_formula(block_data):
    """
    Calcula las cargas semanales con la fórmula ((BW + RM) * FACTOR_MULTIPLICACION) - BW,
    donde BW = 65 kg y el factor depende de RPE y repeticiones.
    """
    BW = 65  # Peso corporal
    duration = block_data["duration"]
    weekly_increment = block_data["weekly_increment"]
    increment_type = block_data["increment_type"]
    rpe = 8  # RPE inicial
    reps_list = [3, 5, 8]

    # Generar las tablas de RPE para cada levantamiento
    rpe_tables = {
        "Pull-Ups": generate_rpe_table(block_data["rm_pullups"]),
        "Dips": generate_rpe_table(block_data["rm_dips"]),
        "Muscle-Ups": generate_rpe_table(block_data["rm_muscleups"]),
        "Squat": generate_rpe_table(block_data["rm_squats"]),
    }
    # Calcular pesos semanales
    weekly_weights = {}
    for lift, rm in {
        "Pull-Ups": block_data["rm_pullups"],
        "Dips": block_data["rm_dips"],
        "Muscle-Ups": block_data["rm_muscleups"],
        "Squat": block_data["rm_squats"],
    }.items():
        weekly_weights[lift] = {}
        for week in range(1, duration + 1):
            progression_data = {}
            for reps in reps_list:
                base_weight = rpe_tables[lift][f"RPE {rpe}"][reps - 1]

                # Ajustar según el incremento semanal
                if increment_type == "percentage":
                    weight = base_weight * (1 + (weekly_increment / 100) * (week - 1))
                elif increment_type == "absolute":
                    weight = base_weight + (weekly_increment * (week - 1))

                progression_data[f"{reps} reps"] = round(weight, 2)
            weekly_weights[lift][f"Semana {week}"] = progression_data

    return weekly_weights


@blocks_bp.route(
    "/edit-block/<string:block_id>", methods=["GET", "POST"], endpoint="edit_block"
)
def edit_block(block_id):
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    # Buscar el bloque a editar
    block = next((b for b in blocks_data["blocks"] if b["id"] == block_id), None)
    if not block:
        flash("No se encontró el bloque para editar.", "error")
        return redirect(url_for("blocks.create_block"))

    if request.method == "POST":
        # Actualizar los datos del bloque desde el formulario
        block["name"] = request.form.get("block_name", block["name"])
        block["duration"] = int(request.form.get("block_duration", block["duration"]))
        block["start_date"] = request.form.get("start_date", block["start_date"])

        # Calcular la nueva fecha de fin basada en la fecha de inicio y duración
        start_date = datetime.strptime(block["start_date"], "%Y-%m-%d").date()
        block["end_date"] = (
            start_date + timedelta(weeks=block["duration"] - 1)
        ).strftime("%Y-%m-%d")

        block["weekly_increment"] = float(
            request.form.get("weekly_increment", block["weekly_increment"])
        )
        block["rm_pullups"] = float(request.form.get("rm_pullups", block["rm_pullups"]))
        block["rm_dips"] = float(request.form.get("rm_dips", block["rm_dips"]))
        block["rm_muscleups"] = float(
            request.form.get("rm_muscleups", block["rm_muscleups"])
        )
        block["rm_squats"] = float(request.form.get("rm_squats", block["rm_squats"]))

        # Restaurar el estado original (siempre que el bloque no esté completado)
        if datetime.strptime(block["end_date"], "%Y-%m-%d").date() < date.today():
            block["status"] = "completed"
        else:
            block["status"] = "in_progress"

        # Guardar los cambios
        save_json(TRAINING_BLOCKS_FILE, blocks_data)
        flash("Bloque actualizado con éxito.", "success")
        return redirect(url_for("blocks.create_block"))

    return render_template("blocks/edit_block.html", block=block)


@blocks_bp.route("/delete-block", methods=["POST"])
def delete_current_block():
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    for block in blocks_data["blocks"]:
        if block["status"] == "in_progress":
            block["status"] = "completed"  # Cambiar estado a "completed"
            break

    save_json(TRAINING_BLOCKS_FILE, blocks_data)
    flash("El bloque actual se marcó como completado.", "success")
    return redirect(url_for("blocks.create_block"))


@blocks_bp.route(
    "/delete-block/<string:block_id>", methods=["POST"], endpoint="delete_block_by_id"
)
def delete_block_by_id(block_id):
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    blocks_data["blocks"] = [
        block for block in blocks_data["blocks"] if block["id"] != block_id
    ]
    save_json(TRAINING_BLOCKS_FILE, blocks_data)

    flash("Bloque eliminado con éxito.", "success")
    return redirect(url_for("blocks.create_block"))


@blocks_bp.route("/get-current-block-json", methods=["GET"])
def get_current_block_json():
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    if blocks_data["blocks"]:
        current_block = blocks_data["blocks"][-1]

        today = datetime.now().date()
        start_date = datetime.strptime(current_block["start_date"], "%Y-%m-%d").date()
        duration = current_block["duration"]

        days_elapsed = (today - start_date).days
        current_week = max(1, (days_elapsed // 7) + 1)
        current_week = min(current_week, duration)

        progress_percentage = (current_week / duration) * 100

        current_block["current_week"] = current_week
        current_block["progress_percentage"] = round(progress_percentage, 2)
        current_block["current_stage"] = "Fase Activa"

        return jsonify(current_block)

    return jsonify({"error": "No hay bloques activos"}), 404


def get_active_block():
    """Devuelve el bloque activo si existe, o None si no hay bloques activos."""
    blocks_data = load_json(TRAINING_BLOCKS_FILE)
    if not blocks_data.get("blocks"):
        return None

    today = date.today()
    for block in blocks_data["blocks"]:
        block_end_date = datetime.strptime(block["end_date"], "%Y-%m-%d").date()
        if block.get("status") == "in_progress":
            if today <= block_end_date:
                return block
            else:
                # Marcar el bloque como completado en lugar de eliminarlo
                block["status"] = "completed"
                save_json(TRAINING_BLOCKS_FILE, blocks_data)
                return None

    return None


@blocks_bp.route("/current-block", methods=["GET"])
def view_current_block():
    # Cargar bloques desde el archivo JSON
    blocks_data = load_json(TRAINING_BLOCKS_FILE)
    all_blocks = blocks_data.get("blocks", [])
    today = date.today()

    # Variables para almacenar bloques activos y completados
    active_block = None
    completed_blocks = []

    # Actualizar el estado de los bloques
    for block in all_blocks:
        start_date = datetime.strptime(block["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(block["end_date"], "%Y-%m-%d").date()

        if today > end_date:
            # Bloque completado
            block["status"] = "completed"
            completed_blocks.append(block)
        elif start_date <= today <= end_date:
            # Bloque activo
            block["status"] = "in_progress"
            active_block = block
        else:
            # Bloque futuro
            block["status"] = "upcoming"

    # Guardar todos los bloques actualizados en el archivo JSON
    save_json(TRAINING_BLOCKS_FILE, {"blocks": all_blocks})

    # Renderizar la página con los bloques actualizados
    return render_template(
        "blocks/current_block.html",
        block=active_block,
        completed_blocks=completed_blocks,
    )


@blocks_bp.route("/get-all-blocks-json", methods=["GET"])
def get_all_blocks_json():
    blocks_data = load_json(TRAINING_BLOCKS_FILE)

    if not blocks_data["blocks"]:
        return jsonify({"error": "No hay bloques registrados"}), 404

    today = datetime.now().date()
    active_block = None
    completed_blocks = []

    # Clasificar los bloques
    for block in blocks_data["blocks"]:
        start_date = datetime.strptime(block["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(block["end_date"], "%Y-%m-%d").date()

        # Calcular estado del bloque
        if today > end_date:
            block["status"] = "completed"
            completed_blocks.append(block)
        elif start_date <= today <= end_date:
            block["status"] = "in_progress"
            active_block = block
        else:
            block["status"] = "upcoming"  # Bloques futuros

    # Calcular progreso del bloque activo
    if active_block:
        start_date = datetime.strptime(active_block["start_date"], "%Y-%m-%d").date()
        duration = active_block["duration"]

        days_elapsed = (today - start_date).days
        current_week = max(1, (days_elapsed // 7) + 1)
        current_week = min(current_week, duration)

        progress_percentage = (current_week / duration) * 100

        active_block["current_week"] = current_week
        active_block["progress_percentage"] = round(progress_percentage, 2)
        active_block["current_stage"] = "Fase Activa"

    return jsonify({"active_block": active_block, "completed_blocks": completed_blocks})
