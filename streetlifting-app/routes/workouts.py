from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from datetime import datetime
from static.utils.workout_helpers import (
    load_workouts_from_json,
    save_workouts_to_json,
    load_data_routines_from_json,
)
from static.utils.rm_calculator import calculate_estimated_one_rm
from static.utils.constants import PREDEFINED_ROUTINES, MAIN_LIFTS
from static.utils.suggested_weights import (
    suggest_weights,
    get_current_block,
    calculate_current_week,
)
from datetime import datetime
from static.utils.data_manager import load_json
import traceback
from urllib.parse import unquote

ROUTINES_NAME_PATH = "routines"

# Crear el Blueprint para los entrenamientos
workouts_bp = Blueprint("workouts", __name__)


def get_last_session_data(workouts_data, exercise_name):
    """Obtiene la última sesión completada para un ejercicio específico."""
    # Filtrar las sesiones que contienen el ejercicio buscado
    filtered_sessions = [
        workout
        for workout in workouts_data
        if any(ex["name"] == exercise_name for ex in workout.get("exercises", []))
    ]

    # Ordenar las sesiones por fecha de forma descendente
    filtered_sessions.sort(
        key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"), reverse=True
    )

    # Buscar la sesión más reciente que esté completada
    for session in filtered_sessions:
        for exercise in session.get("exercises", []):
            if exercise["name"] == exercise_name and exercise.get("completed", False):
                return {
                    "weight": exercise.get("weight"),
                    "reps": exercise.get("reps"),
                    "date": session["date"],
                }

    # Si no se encuentra ninguna sesión completada, devolver None
    return None


def normalize_exercise_name(name: str) -> str:
    # Elimina paréntesis, pasa a minúsculas, reemplaza espacios por _
    return name.lower().replace("(", "").replace(")", "").replace(" ", "_")


def normalize_day_type(day_type):
    return day_type.strip()


@workouts_bp.route("/log/<path:day_type>", methods=["GET"])
def log_workout(day_type):
    # day_type = unquote(day_type)  # Decodificar espacios y emojis

    from urllib.parse import unquote

    # Decodificar y normalizar el parámetro
    raw_day_type = day_type
    day_type = unquote(day_type)

    print(f"Raw day_type: {raw_day_type} ({repr(raw_day_type)})")
    print(f"Decoded day_type: {day_type} ({repr(day_type)})")

    try:
        # Cargar rutinas y entrenamientos
        routines_data = load_json(ROUTINES_NAME_PATH)
        # ver names de routines_Data
        available_routines = {r["name"]: r for r in routines_data.get("routines", [])}
        print(f"available_routines: {available_routines}")

        if day_type not in available_routines:
            print(f"day_type recibido: {day_type}")

            flash("Tipo de día no válido.", "error")

            return redirect(url_for("workouts.select_workout_type"))

        workout_date = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))
        workouts_data = load_workouts_from_json()

        # Inicializar o cargar entrenamiento pendiente
        pending_workout = next(
            (
                w
                for w in workouts_data["workouts"]
                if w.get("inprogress", False) and w["day_type"] == day_type
            ),
            None,
        )

        if not pending_workout:
            routine_exercises = [
                {"name": exercise, "sets": []}
                for exercise in available_routines[day_type]["exercises"]
            ]
            pending_workout = {
                "id": max([w["id"] for w in workouts_data["workouts"]], default=0) + 1,
                "date": workout_date,
                "day_type": day_type,
                "inprogress": True,
                "completed": False,
                "exercises": routine_exercises,
            }
            workouts_data["workouts"].append(pending_workout)
            save_workouts_to_json(workouts_data)

        current_block = get_current_block()
        start_date = datetime.strptime(current_block["start_date"], "%Y-%m-%d").date()
        current_week = calculate_current_week(start_date)
        suggested_weights = suggest_weights(
            MAIN_LIFTS, current_block=current_block, current_week=current_week
        )

        return render_template(
            "log_workout.html",
            day_type=day_type,
            today_date=workout_date,
            exercises=pending_workout["exercises"] if pending_workout else [],
            pending_workout=pending_workout,
            suggested_weights=suggested_weights,
        )

    except Exception as e:
        flash(f"Error: {e}", "error")
        return redirect(url_for("workouts.select_workout_type"))


@workouts_bp.route("/select-workout-type", methods=["GET", "POST"])
def select_workout_type():
    """Selecciona el tipo de entrenamiento."""
    selected_date = request.args.get("date", None)

    if request.method == "POST":
        # Capturar el tipo de entrenamiento seleccionado
        day_type = request.form.get("day_type")
        if day_type:
            # Redirigir a la página para registrar el entrenamiento
            return redirect(
                url_for("workouts.log_workout", day_type=day_type, date=selected_date)
            )

    # Cargar las rutinas desde el archivo JSON
    routines_data = load_json(ROUTINES_NAME_PATH)
    available_day_types = [
        routine["name"] for routine in routines_data.get("routines", [])
    ]

    return render_template(
        "select_workout_type.html",
        selected_date=selected_date,
        available_day_types=available_day_types,
    )


@workouts_bp.route("/history", methods=["GET"])
def history():
    """Muestra el historial de entrenamientos."""
    workouts_data = load_workouts_from_json()

    if isinstance(workouts_data, dict):
        workouts = workouts_data.get("workouts", [])
    elif isinstance(workouts_data, list):
        workouts = workouts_data
    else:
        workouts = []

    # Obtener parámetros de filtro
    year_filter = request.args.get("year", type=int)
    month_filter = request.args.get("month", type=int)

    # Aplicar filtros de año y mes
    if year_filter:
        workouts = [
            workout
            for workout in workouts
            if datetime.strptime(workout["date"], "%Y-%m-%d").year == year_filter
        ]
    if month_filter:
        workouts = [
            workout
            for workout in workouts
            if datetime.strptime(workout["date"], "%Y-%m-%d").month == month_filter
        ]

    # Ordenar los entrenamientos de más recientes a más antiguos
    workouts = sorted(
        workouts, key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"), reverse=True
    )

    # Filtrar solo los main lifts
    for workout in workouts:
        workout["exercises"] = [
            ex for ex in workout["exercises"] if ex["name"] in MAIN_LIFTS
        ]

    # Generar listas de años y meses dinámicamente
    all_dates = [
        datetime.strptime(workout["date"], "%Y-%m-%d")
        for workout in workouts_data.get("workouts", [])
    ]
    years = sorted(set(date.year for date in all_dates))
    months = [
        {"name": datetime(1900, m, 1).strftime("%B"), "value": m} for m in range(1, 13)
    ]

    return render_template(
        "history.html",
        workouts=workouts,
        years=years,
        months=months,
        selected_year=year_filter,
        selected_month=month_filter,
    )


@workouts_bp.route("/view/<int:workout_id>", methods=["GET"])
def view_workout(workout_id):
    """Muestra los detalles de un entrenamiento específico."""
    workouts_data = load_workouts_from_json()

    # Asegurar que `workouts_data` tenga el formato adecuado
    if isinstance(workouts_data, dict):  # Si es un diccionario
        workouts = workouts_data.get("workouts", [])
    elif isinstance(workouts_data, list):  # Si es directamente una lista
        workouts = workouts_data
    else:
        workouts = []

    # Buscar el entrenamiento por ID
    workout = next((w for w in workouts if w["id"] == workout_id), None)

    if not workout:
        flash("Entrenamiento no encontrado.", "error")
        return redirect(url_for("workouts.history"))

    return render_template("view_workout.html", workout=workout)


@workouts_bp.route("/edit/<int:workout_id>", methods=["GET", "POST"])
def edit_workout(workout_id):
    """Edita un entrenamiento específico."""

    workouts_data = load_workouts_from_json()
    workouts = workouts_data.get("workouts", [])
    # Buscar el entrenamiento por ID
    workout = next((w for w in workouts if w["id"] == workout_id), None)

    day_type = workout.get("day_type")

    if not workout:
        flash("Entrenamiento no encontrado.", "error")
        return redirect(url_for("workouts.history"))

    if request.method == "POST":
        print("Llego al POST")  # Verificar si entra al POST

        try:
            # Actualizar los datos básicos del entrenamiento
            workout["date"] = request.form["date"]
            workout["day_type"] = request.form.get("day_type", workout["day_type"])
            workout["exercises"] = []
            print("workout", workout)

            # Obtener datos de los ejercicios y sets del formulario
            exercise_names = request.form.getlist("exercise_name[]")
            weights = request.form.getlist("weight[]")
            reps = request.form.getlist("reps[]")
            rpes = request.form.getlist("rpe[]")
            notes = request.form.getlist("notes[]")
            completions = request.form.getlist("completed[]")

            # Agrupar sets por ejercicio
            set_index = 0
            for exercise_name in exercise_names:
                exercise = {"name": exercise_name, "sets": []}
                num_sets = int(request.form.get(f"num_sets_{exercise_name}", 1))

                for _ in range(num_sets):
                    if set_index < len(weights):  # Evitar desbordamientos
                        set_data = {
                            "weight": (
                                float(weights[set_index])
                                if weights[set_index]
                                else None
                            ),
                            "reps": int(reps[set_index]) if reps[set_index] else None,
                            "rpe": float(rpes[set_index]) if rpes[set_index] else None,
                            "notes": notes[set_index] if notes[set_index] else "",
                            "completed": completions[set_index] == "true",
                        }
                        exercise["sets"].append(set_data)
                        set_index += 1

                workout["exercises"].append(exercise)
            print("workout", workout)
            # Guardar los datos actualizados
            if isinstance(workouts_data, dict):  # Si es un diccionario
                workouts_data["workouts"] = workouts
            else:  # Si es directamente una lista
                workouts_data = workouts

            save_workouts_to_json(workouts_data)

            flash("Entrenamiento actualizado con éxito.", "success")
            return redirect(url_for("history"))
        except Exception as e:
            flash(f"Error al actualizar el entrenamiento: {str(e)}", "error")
            return redirect(url_for("workouts.edit_workout", workout_id=workout_id))

    return render_template("edit_workout.html", workout=workout, day_type=day_type)


@workouts_bp.route("/edit-workout-progress", methods=["POST"])
def edit_workout_progress():
    """
    Edita un entrenamiento completado en el archivo JSON.
    """
    import traceback

    try:
        # Obtener los datos enviados como JSON
        form_data = request.get_json()

        # Validar que se haya recibido un JSON válido
        if not form_data or "exercises" not in form_data:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "El cuerpo de la petición está vacío o no contiene ejercicios.",
                    }
                ),
                400,
            )

        # Validar campos necesarios
        if not form_data.get("id") or not form_data.get("day_type"):
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Faltan datos necesarios (id o day_type).",
                    }
                ),
                400,
            )

        # Cargar los entrenamientos desde el archivo JSON
        workouts_data = load_workouts_from_json()

        # Buscar el entrenamiento por ID
        workout = next(
            (
                w
                for w in workouts_data["workouts"]
                if str(w.get("id")) == str(form_data["id"])
            ),
            None,
        )

        if not workout:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"No se encontró un entrenamiento con ID {form_data['id']}.",
                    }
                ),
                404,
            )

        # Actualizar los ejercicios
        updated_exercises = form_data.get("exercises", [])
        for exercise in updated_exercises:
            # Convertir nombres seguros de vuelta a formato legible
            exercise["name"] = exercise["name"].replace("_", " ")

        workout["exercises"] = updated_exercises
        workout["date"] = form_data.get("date", workout["date"])

        # Mantener el estado de completado
        workout["inprogress"] = False
        workout["completed"] = True

        # Guardar los datos actualizados
        save_workouts_to_json(workouts_data)

        return (
            jsonify(
                {"success": True, "message": "Entrenamiento editado exitosamente."}
            ),
            200,
        )

    except Exception as e:
        import traceback

        print("Error al editar el entrenamiento:", e)
        print(traceback.format_exc())
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Ocurrió un error inesperado al editar el entrenamiento.",
                    "error": str(e),
                }
            ),
            500,
        )


@workouts_bp.route("/delete/<int:workout_id>", methods=["POST"])
def delete_workout(workout_id):
    """Elimina un entrenamiento específico."""
    workouts_data = load_workouts_from_json()
    workout = next(
        (w for w in workouts_data.get("workouts", []) if w["id"] == workout_id), None
    )

    if not workout:
        flash("Entrenamiento no encontrado.", "error")
        return redirect(url_for("workouts.history"))

    workouts_data["workouts"].remove(workout)
    save_workouts_to_json(workouts_data)

    flash("Entrenamiento eliminado con éxito.", "success")
    return redirect(url_for("workouts.history"))


@workouts_bp.route("/pending-workouts", methods=["GET"])
def get_pending_workouts():
    """Devuelve entrenamientos pendientes."""
    workouts_data = load_workouts_from_json()
    pending_workouts = []

    for workout in workouts_data.get("workouts", []):
        # Asegúrate de que 'date' sea una cadena
        if isinstance(workout.get("date"), list):
            workout["date"] = workout["date"][0]

        if workout.get("inprogress", False) and not workout.get("completed", False):
            pending_workouts.append(workout)

    return jsonify(pending_workouts)


@workouts_bp.route("/save-workout-progress", methods=["POST"])
def save_workout_progress():
    """
    Guarda el progreso del formulario de entrenamiento en el JSON.
    """
    import traceback

    try:
        # Obtener los datos enviados como JSON
        form_data = request.get_json()

        # Validar que se haya recibido un JSON válido
        if not form_data or "exercises" not in form_data:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "El cuerpo de la petición está vacío o no contiene ejercicios.",
                    }
                ),
                400,
            )

        # Validar campos necesarios
        if not form_data.get("id") or not form_data.get("day_type"):
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Faltan datos necesarios (id o day_type).",
                    }
                ),
                400,
            )

        # Cargar los entrenamientos desde el archivo JSON
        workouts_data = load_workouts_from_json()

        # Buscar el entrenamiento por ID y tipo de día
        pending_workout = next(
            (
                w
                for w in workouts_data["workouts"]
                if str(w.get("id")) == str(form_data["id"])
                and w.get("day_type") == form_data["day_type"]
            ),
            None,
        )

        if not pending_workout:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"No se encontró un entrenamiento pendiente para ID {form_data['id']} y tipo de día {form_data['day_type']}.",
                    }
                ),
                404,
            )

        # Actualizar datos del entrenamiento pendiente
        updated_exercises = form_data.get("exercises", [])
        for exercise in updated_exercises:
            # Reemplazar guiones bajos con espacios en los nombres
            exercise["name"] = exercise["name"].replace("_", " ")

        pending_workout["exercises"] = updated_exercises
        pending_workout["date"] = form_data.get("date", pending_workout["date"])

        # Cambiar el estado solo si finalize es True
        if form_data.get("finalize", False):
            pending_workout["inprogress"] = False
            pending_workout["completed"] = True
            redirect_url = url_for("index.index")  # Ruta de redirección
        else:
            pending_workout["inprogress"] = True
            pending_workout["completed"] = False
            redirect_url = None  # No redirigir

        # Guardar los datos actualizados en el archivo JSON
        save_workouts_to_json(workouts_data)

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Progreso guardado exitosamente.",
                    "redirect_url": redirect_url,
                }
            ),
            200,
        )

    except Exception as e:
        # Capturar errores y devolver una respuesta con traza de error
        print("Error al guardar el progreso:", e)
        print(traceback.format_exc())
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Ocurrió un error inesperado al guardar el progreso.",
                    "error": str(e),
                }
            ),
            500,
        )


@workouts_bp.route("/load-workout-progress", methods=["GET"])
def load_workout_progress():
    """Carga el progreso del formulario de entrenamiento desde el JSON."""
    try:
        # Cargar entrenamientos
        workouts_data = load_workouts_from_json()

        # Obtener `day_type` desde los argumentos si está disponible
        day_type = request.args.get("day_type")

        # Filtrar el entrenamiento pendiente
        if day_type:
            pending_workout = next(
                (
                    w
                    for w in workouts_data["workouts"]
                    if w.get("inprogress", False) and w["day_type"] == day_type
                ),
                None,
            )
        else:
            pending_workout = next(
                (w for w in workouts_data["workouts"] if w.get("inprogress", False)),
                None,
            )

        if not pending_workout:
            print("No se encontró un entrenamiento pendiente.")
            return jsonify({"pending": False, "formData": {}}), 200

        return jsonify({"pending": True, "formData": pending_workout}), 200
    except Exception as e:
        print("Error al cargar progreso:", e)
        return (
            jsonify({"success": False, "message": f"Error al cargar progreso: {e}"}),
            500,
        )


@workouts_bp.route("/cancel-workout", methods=["POST"])
def cancel_workout():
    """Cancela un entrenamiento en progreso."""
    try:
        # Cargar los datos de los entrenamientos
        workouts_data = load_workouts_from_json()

        # Buscar el entrenamiento en progreso
        pending_workout = next(
            (w for w in workouts_data["workouts"] if w.get("inprogress", False)), None
        )

        if pending_workout:
            # Eliminar el entrenamiento pendiente
            workouts_data["workouts"].remove(pending_workout)
            save_workouts_to_json(workouts_data)

        return jsonify({"success": True, "message": "Entrenamiento cancelado."}), 200
    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": f"Error al cancelar entrenamiento: {e}"}
            ),
            500,
        )
