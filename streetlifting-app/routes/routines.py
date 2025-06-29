from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
import json

ROUTINE_FILE = "static/utils/routines.json"
EXERCISES_FILE = "static/utils/exercises.json"

routines_bp = Blueprint("routines", __name__, template_folder="templates")


# Helper functions
def load_routines():
    """Carga todas las rutinas desde el archivo JSON."""
    try:
        with open(ROUTINE_FILE, "r") as file:
            data = json.load(file)
            return data.get("routines", [])
    except (FileNotFoundError, json.JSONDecodeError):
        print(
            "Error al cargar rutinas. Asegúrate de que el archivo existe y tiene una estructura válida."
        )
        return []


def save_routines(routines):
    """Guarda las rutinas en el archivo JSON."""
    with open(ROUTINE_FILE, "w") as file:
        json.dump({"routines": routines}, file, indent=4)


def add_routine(name, exercises, days, main_lifts):
    """Agrega una nueva rutina al archivo JSON."""
    routines = load_routines()
    if any(routine["name"] == name for routine in routines):
        raise ValueError(f"Ya existe una rutina con el nombre '{name}'.")

    # Crear nueva rutina con días y main lifts
    new_routine = {
        "name": name,
        "exercises": exercises,
        "days": [int(day) for day in days],  # Convertir días a enteros
        "main_lifts": main_lifts,
    }
    routines.append(new_routine)
    save_routines(routines)
    print(f"Rutina '{name}' agregada correctamente.")


def edit_routine(old_name, new_name, new_exercises):
    """Edita una rutina existente."""
    routines = load_routines()
    for routine in routines:
        if routine["name"] == old_name:
            routine["name"] = new_name
            routine["exercises"] = new_exercises
            save_routines(routines)
            return
    raise ValueError(f"No se encontró una rutina con el nombre '{old_name}'.")


def delete_routine(name):
    """Elimina una rutina por su nombre."""
    routines = load_routines()
    routines = [routine for routine in routines if routine["name"] != name]
    save_routines(routines)


# Routes
@routines_bp.route("/routines", methods=["GET"])
def view_routines():
    """Muestra todas las rutinas."""
    routines = load_routines()
    return render_template("routines.html", routines=routines)


@routines_bp.route("/routines/add", methods=["GET", "POST"])
def add_routine_route():
    """Ruta para agregar una nueva rutina."""
    if request.method == "POST":
        name = request.form.get("name")
        exercises = request.form.getlist("exercises[]")
        days = request.form.getlist("days[]")  # Extraer días seleccionados
        main_lifts = request.form.getlist(
            "main_lift[]"
        )  # Extraer main lifts seleccionados

        try:
            add_routine(name, exercises, days, main_lifts)
            flash(f"Rutina '{name}' agregada correctamente.", "success")
            return redirect(url_for("routines.view_routines"))
        except ValueError as e:
            flash(str(e), "error")

    exercises = load_exercises()
    return render_template("add_routine.html", exercises=exercises)


def normalize_exercises(routines, all_exercises):
    for routine in routines:
        routine["exercises"] = [e.strip().lower() for e in routine["exercises"]]
    all_exercises = [e.strip().lower() for e in all_exercises]
    return routines, all_exercises


@routines_bp.route("/routines/edit/<string:name>", methods=["GET", "POST"])
def edit_routine_route(name):
    """Ruta para editar una rutina existente."""
    routines = load_routines()
    routine = next(
        (r for r in routines if r["name"].strip().lower() == name.strip().lower()), None
    )
    if not routine:
        flash(f"No se encontró la rutina '{name}'.", "error")
        return redirect(url_for("routines.view_routines"))

    if request.method == "POST":
        new_name = request.form.get("name")
        new_exercises = request.form.getlist("exercises[]")

        print("Nombre recibido:", new_name)
        print("Ejercicios recibidos:", new_exercises)

        try:
            edit_routine(name, new_name, new_exercises)
            flash(f"Rutina '{name}' actualizada correctamente.", "success")
            return redirect(url_for("routines.view_routines"))
        except ValueError as e:
            flash(str(e), "error")

    exercises = load_exercises()
    print("Ejercicios disponibles:", exercises)
    return render_template("edit_routine.html", routine=routine, exercises=exercises)


@routines_bp.route("/routines/delete/<string:name>", methods=["GET", "POST"])
def delete_routine_route(name):
    """Ruta para eliminar una rutina."""
    try:
        delete_routine(name)
        flash(f"Rutina '{name}' eliminada correctamente.", "success")
    except ValueError as e:
        flash(str(e), "error")
    return redirect(url_for("routines.view_routines"))


# Helper to load exercises from a predefined list or file
def load_exercises():
    """Carga una lista de ejercicios predefinidos desde un archivo JSON."""
    try:
        with open(EXERCISES_FILE, "r") as file:
            exercises = json.load(file)
            return exercises
    except FileNotFoundError:
        print(f"Error: El archivo {EXERCISES_FILE} no se encontró.")
        return []
    except json.JSONDecodeError:
        print(f"Error: No se pudo decodificar el archivo JSON {EXERCISES_FILE}.")
        return []
