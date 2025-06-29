from flask import Blueprint, request, render_template, redirect, url_for, flash
from datetime import datetime
from static.utils.data_manager import load_json, save_json
from static.utils.file_initializer import INITIAL_STRUCTURES
import uuid

# Crear el Blueprint para setup
setup_bp = Blueprint("setup", __name__)

# Nombre de los archivos JSON
USER_DATA_FILE = "user_data"
DATA_RM_FILE = "data_rm"
ROUTINES_FILE = "routines"


@setup_bp.route("/setup", methods=["GET", "POST"])
def setup():
    """Configura o edita los datos iniciales del usuario."""
    # Cargar datos existentes
    user_data = load_json(USER_DATA_FILE)
    rm_data = load_json(DATA_RM_FILE)

    # Verificar si los datos iniciales están vacíos
    is_empty = (
        not user_data["name"]
        and not user_data["age"]
        and not user_data["weight"]
        and not user_data["height"]
    )

    if is_empty:
        # Si los datos están vacíos, redirigir al formulario inicial
        if request.method == "POST":
            # Generar un ID único para el usuario y RM
            user_id = str(uuid.uuid4())
            record_id = str(uuid.uuid4())

            # Recopilar datos iniciales del formulario
            user = {
                "user_id": user_id,
                "name": request.form["name"],
                "age": int(request.form["age"]),
                "weight": float(request.form["weight"]),
                "height": float(request.form["height"]),
                "rm_initial": {
                    "id": record_id,
                    "pull_up": float(request.form.get("pull_up_rm", 0)),
                    "weighted_dips": float(request.form.get("dip_rm", 0)),
                    "squat": float(request.form.get("squat_rm", 0)),
                    "muscle_up": float(request.form.get("muscle_up_rm", 0)),
                },
                "training_start_date": datetime.now().strftime("%Y-%m-%d"),
            }

            # Crear el RM inicial
            initial_rm = {
                "id": record_id,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "pull_up_rm": user["rm_initial"]["pull_up"],
                "dip_rm": user["rm_initial"]["weighted_dips"],
                "squat_rm": user["rm_initial"]["squat"],
                "muscle_up_rm": user["rm_initial"]["muscle_up"],
            }

            # Guardar en archivos JSON
            save_json(USER_DATA_FILE, user)
            rm_data["initial_data"] = initial_rm
            rm_data["rm_records"].append(initial_rm)
            save_json(DATA_RM_FILE, rm_data)

            flash("Datos iniciales configurados correctamente.", "success")
            return redirect(url_for("index.index"))  # Redirige al menú principal

        # Renderizar formulario de configuración inicial
        return render_template("setup.html")

    # Si ya hay datos iniciales, mostrar opciones para editar o eliminar
    if request.method == "POST":
        action = request.form.get("action")
        if action == "edit":
            return redirect(url_for("setup.edit_user_data"))
        elif action == "delete":
            # Eliminar datos del usuario y restablecer estructura inicial
            user_data = {
                "user_id": "",
                "name": "",
                "age": 0,
                "weight": 0.0,
                "height": 0.0,
                "rm_initial": {
                    "id": "",
                    "pull_up": 0.0,
                    "weighted_dips": 0.0,
                    "squat": 0.0,
                    "muscle_up": 0.0,
                },
                "training_start_date": "",
            }
            rm_data["initial_data"] = {}
            save_json(USER_DATA_FILE, user_data)
            save_json(DATA_RM_FILE, rm_data)

            flash(
                "Datos iniciales eliminados y restablecidos correctamente.", "success"
            )
            return redirect(url_for("setup.setup"))

    # Renderizar opciones para editar o eliminar
    return render_template("setup_existing.html", user_data=user_data)


@setup_bp.route("/edit-user-data", methods=["GET", "POST"])
def edit_user_data():
    """Edita los datos iniciales del usuario."""
    user_data = load_json(USER_DATA_FILE)
    rm_data = load_json(DATA_RM_FILE)

    if not user_data:
        flash("No hay datos iniciales para editar.", "error")
        return redirect(url_for("setup.setup"))

    if request.method == "POST":
        # Actualizar datos iniciales
        user_data["name"] = request.form["name"]
        user_data["age"] = int(request.form["age"])
        user_data["weight"] = float(request.form["weight"])
        user_data["height"] = float(request.form["height"])

        # Actualizar RM inicial
        rm_data["initial_data"].update(
            {
                "pull_up_rm": float(request.form.get("pull_up_rm", 0)),
                "dip_rm": float(request.form.get("dip_rm", 0)),
                "squat_rm": float(request.form.get("squat_rm", 0)),
                "muscle_up_rm": float(request.form.get("muscle_up_rm", 0)),
            }
        )

        save_json(USER_DATA_FILE, user_data)
        save_json(DATA_RM_FILE, rm_data)

        flash("Datos iniciales actualizados con éxito.", "success")
        return redirect(url_for("setup.setup"))

    # Renderizar formulario con los datos existentes
    return render_template(
        "edit_user_data.html", user_data=user_data, initial_rm=rm_data["initial_data"]
    )


@setup_bp.route("/create_routine", methods=["GET", "POST"])
def create_routine():
    """Crea una nueva rutina y la guarda en routines.json."""
    # Cargar rutinas preexistentes
    routines_data = load_json(ROUTINES_FILE)

    if request.method == "POST":
        # Recibir datos del formulario
        routine_name = request.form.get("routine_name", "Mi Rutina")
        training_day = request.form.get("training_day")  # Día único
        exercises = request.form.getlist("exercises[]")  # Lista de ejercicios

        # Validación básica
        if not routine_name or not training_day or not exercises:
            flash("Por favor, completa todos los campos.", "error")
            return redirect(url_for("setup.create_routine"))

        # Crear nueva rutina
        new_routine = {
            "name": routine_name,
            "day": training_day,
            "exercises": [
                {"name": ex} for ex in exercises
            ],  # Convertir ejercicios a dict
        }

        # Agregar la rutina a los datos existentes
        routines_data["routines"].append(new_routine)
        save_json(ROUTINES_FILE, routines_data)

        flash("Rutina creada con éxito.", "success")
        return redirect(url_for("workouts.view_routines"))

    # Renderizar la página para crear rutina
    return render_template(
        "create_routine.html", preloaded_routines=routines_data["routines"]
    )
