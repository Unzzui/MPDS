from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from datetime import datetime
from static.utils.workout_helpers import (
    calculate_volume_data,
    calculate_frequency_data,
    load_workouts_from_json,
    load_data_rm_from_json,
    save_data_rm_to_json,
    calculate_exercise_distribution,
)
import uuid
import json

# Crear un Blueprint para gestionar los registros de RM
records_bp = Blueprint("records", __name__)

# Rutas de los archivos JSON
DATA_RM_FILE = "data_rm"


# Funciones Auxiliares
def generate_unique_id():
    """Genera un ID único usando uuid."""
    return str(uuid.uuid4())


# Rutas
@records_bp.route("/add_record", methods=["GET", "POST"])
def add_record():
    """Procesa el formulario para agregar un nuevo registro."""
    data_rm = load_data_rm_from_json()

    if request.method == "POST":
        # Crear un nuevo registro
        new_record = {
            "id": generate_unique_id(),
            "date": request.form.get("date", datetime.now().strftime("%Y-%m-%d")),
            "pull_up_rm": float(request.form.get("pull_up_rm", 0)),
            "dip_rm": float(request.form.get("dip_rm", 0)),
            "squat_rm": float(request.form.get("squat_rm", 0)),
            "muscle_up_rm": float(request.form.get("muscle_up_rm", 0)),
        }

        print("Nuevo registro a agregar:", new_record)

        # Agregar el nuevo registro a rm_records
        data_rm["rm_records"].append(new_record)

        print("Estado de data_rm antes de guardar:", data_rm)

        # Guardar los datos
        save_data_rm_to_json(data_rm)

        print("Contenido guardado en el archivo JSON.")
        flash("Registro añadido con éxito.", "success")
        return redirect(url_for("records.manage_records"))

    # Renderizar el formulario si es una solicitud GET
    return render_template("add_record.html")


@records_bp.route("/delete_record/<record_id>", methods=["POST"])
def delete_record(record_id):
    """Elimina un registro de RM por ID."""
    records_data = load_data_rm_from_json()

    # Filtrar registros para eliminar el registro correspondiente
    records_data["rm_records"] = [
        record for record in records_data["rm_records"] if record["id"] != record_id
    ]

    # Guardar los datos actualizados
    save_data_rm_to_json(records_data)

    flash("Registro eliminado con éxito.", "success")
    return redirect(url_for("records.manage_records"))


@records_bp.route("/edit_record/<record_id>", methods=["GET", "POST"])
def edit_record(record_id):
    """Edita un registro específico por ID."""
    data_rm = load_data_rm_from_json()

    # Buscar el registro a editar
    record_to_edit = next(
        (record for record in data_rm["rm_records"] if record["id"] == record_id), None
    )

    if not record_to_edit:
        flash("Registro no encontrado.", "error")
        return redirect(url_for("records.manage_records"))

    if request.method == "POST":
        # Actualizar el registro
        record_to_edit["pull_up_rm"] = float(request.form.get("pull_up_rm", 0))
        record_to_edit["dip_rm"] = float(request.form.get("dip_rm", 0))
        record_to_edit["squat_rm"] = float(request.form.get("squat_rm", 0))
        record_to_edit["muscle_up_rm"] = float(request.form.get("muscle_up_rm", 0))

        # Guardar los datos actualizados
        with open(DATA_RM_FILE, "w") as file:
            json.dump(data_rm, file, indent=4)

        flash("Registro actualizado con éxito.", "success")
        return redirect(url_for("records.manage_records"))

    # Renderizar el formulario con el registro seleccionado
    return render_template("edit_record.html", record=record_to_edit)


@records_bp.route("/records", methods=["GET"])
def manage_records():
    """Muestra la lista de registros únicos basados en el ID."""
    # Cargar los datos desde el archivo JSON
    data_rm = load_data_rm_from_json()

    # Obtener initial_data y rm_records
    initial_data = data_rm.get("initial_data", {})
    rm_records = data_rm.get("rm_records", [])

    # Crear un diccionario para asegurar unicidad basada en el ID
    unique_records = {}

    # Validar si initial_data tiene datos válidos antes de agregarlo
    if initial_data.get("id") and initial_data.get("date"):
        unique_records[initial_data["id"]] = initial_data

    # Agregar registros de rm_records (sobrescribiendo si el ID ya existe)
    for record in rm_records:
        if (
            "id" in record and "date" in record
        ):  # Validar que cada registro tenga un ID y una fecha
            unique_records[record["id"]] = record

    # Convertir los registros únicos a una lista para mostrar
    records = list(unique_records.values())

    # Renderizar la página con los registros únicos
    return render_template("records.html", rm_data=records)


@records_bp.route("/progress", methods=["GET"])
def progress():
    """Genera datos para mostrar el progreso."""
    # Cargar los datos de entrenamientos
    workouts_data = load_workouts_from_json()
    if not isinstance(workouts_data, dict) or "workouts" not in workouts_data:
        raise TypeError(
            "workouts_data debe ser un diccionario que contiene la clave 'workouts'"
        )

    # Extraer la lista de entrenamientos
    workouts = workouts_data["workouts"]

    # Cargar los datos de RM
    data_rm = load_data_rm_from_json()

    # Calcular frecuencia de ejercicios
    frequency_map = calculate_frequency_data(workouts)

    # Calcular volumen por fecha
    volume_chart_data = calculate_volume_data(workouts)

    # Calcular distribución de ejercicios
    exercise_distribution = calculate_exercise_distribution(workouts)
    # Ordenar registros de RM
    rm_records = data_rm.get("rm_records", [])
    records = rm_records

    # Ordenar por fecha y validar
    try:
        records = sorted(
            records,
            key=lambda x: datetime.strptime(x.get("date", "1970-01-01"), "%Y-%m-%d"),
        )
    except ValueError as e:
        print(f"Error al ordenar registros: {e}")
        records = []

    return render_template(
        "progress.html",
        volume_chart_data=volume_chart_data,
        frequency_map=frequency_map,
        records=records,
        exercise_distribution=exercise_distribution,
    )
