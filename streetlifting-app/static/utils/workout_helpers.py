import json
import os
import uuid
from static.utils.constants import MAIN_LIFTS

WORKOUTS_JSON_PATH = "static/utils/workouts.json"
DATA_RM_JSON_PATH = "static/utils/data_rm.json"
DATA_ROUTINES_JSON_PATH = "static/utils/data_routines.json"


def load_workouts_from_json():
    """Carga los datos de entrenamientos desde un archivo JSON, manejando todos los posibles errores."""
    try:
        # Verificar si el archivo existe
        if not os.path.exists(WORKOUTS_JSON_PATH):
            print("Archivo JSON no encontrado. Creando uno nuevo...")
            regenerate_workouts_json()
            return {"workouts": []}

        # Verificar si el archivo está vacío
        if os.stat(WORKOUTS_JSON_PATH).st_size == 0:
            print("Archivo JSON vacío. Regenerando archivo...")
            regenerate_workouts_json()
            return {"workouts": []}

        # Intentar abrir y cargar el archivo JSON
        with open(WORKOUTS_JSON_PATH, "r") as file:
            data = json.load(file)  # Esto puede lanzar json.JSONDecodeError
        return data

    except json.JSONDecodeError as e:
        # Error al decodificar JSON (archivo corrupto o malformado)
        print(f"Error al cargar JSON (formato inválido): {e}. Regenerando archivo...")
        regenerate_workouts_json()
        return {"workouts": []}

    except FileNotFoundError:
        # El archivo no existe (aunque ya verificamos antes, incluimos esta excepción por seguridad)
        print("Archivo JSON no encontrado. Creando uno nuevo...")
        regenerate_workouts_json()
        return {"workouts": []}

    except PermissionError as e:
        # Error de permisos (lectura o escritura)
        print(f"Error de permisos al acceder al archivo JSON: {e}")
        raise PermissionError(
            "No se puede acceder al archivo JSON debido a permisos insuficientes."
        )

    except IsADirectoryError as e:
        # El archivo esperado es en realidad un directorio
        print(f"Error: Se esperaba un archivo JSON pero se encontró un directorio: {e}")
        raise IsADirectoryError(
            "La ruta especificada es un directorio, no un archivo JSON."
        )

    except Exception as e:
        # Manejar cualquier otro error inesperado
        print(f"Error inesperado al cargar el archivo JSON: {e}")
        regenerate_workouts_json()
        return {"workouts": []}


def regenerate_workouts_json():
    """Regenera el archivo JSON con una estructura vacía, manejando posibles errores."""
    try:
        with open(WORKOUTS_JSON_PATH, "w") as file:
            json.dump({"workouts": []}, file, indent=4)
        print("Archivo JSON regenerado exitosamente.")
    except PermissionError as e:
        print(f"Error de permisos al regenerar el archivo JSON: {e}")
        raise PermissionError(
            "No se puede regenerar el archivo JSON debido a permisos insuficientes."
        )
    except IsADirectoryError as e:
        print(f"Error: Se esperaba un archivo JSON pero se encontró un directorio: {e}")
        raise IsADirectoryError(
            "La ruta especificada es un directorio, no un archivo JSON."
        )
    except Exception as e:
        print(f"Error inesperado al regenerar el archivo JSON: {e}")
        raise Exception("Error inesperado al regenerar el archivo JSON.")


def save_workouts_to_json(data):
    """Guarda los entrenamientos en el archivo JSON."""
    try:
        with open(WORKOUTS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error al guardar entrenamientos: {e}")


def calculate_exercise_distribution(workouts):
    """Calcula la distribución de ejercicios en los entrenamientos."""
    exercise_distribution = {}

    # Verifica si workouts es una lista
    if not isinstance(workouts, list):
        raise TypeError("workouts debe ser una lista de entrenamientos")

    for workout in workouts:
        # Verifica si el entrenamiento tiene una clave 'exercises'
        if "exercises" not in workout:
            continue

        for exercise in workout["exercises"]:
            # Asegúrate de que cada ejercicio sea un diccionario con la clave 'name'
            if not isinstance(exercise, dict) or "name" not in exercise:
                continue

            name = exercise["name"]
            if name not in exercise_distribution:
                exercise_distribution[name] = 0
            exercise_distribution[name] += 1

    return exercise_distribution


def calculate_volume_data(workouts):
    """Calcula el volumen total cargado por ejercicio por fecha."""
    volume_data = {}

    # Verifica si workouts es una lista
    if not isinstance(workouts, list):
        raise TypeError("workouts debe ser una lista de entrenamientos")

    for workout in workouts:
        # Verifica si el entrenamiento tiene una clave 'date' y 'exercises'
        if (
            not isinstance(workout, dict)
            or "date" not in workout
            or "exercises" not in workout
        ):
            continue

        date = workout["date"]
        if date not in volume_data:
            volume_data[date] = {}

        for exercise in workout["exercises"]:
            # Asegúrate de que cada ejercicio sea un diccionario con las claves esperadas
            if (
                not isinstance(exercise, dict)
                or "name" not in exercise
                or "weight" not in exercise
                or "reps" not in exercise
            ):
                continue

            name = exercise["name"]
            volume = exercise["weight"] * exercise["reps"]
            if name not in volume_data[date]:
                volume_data[date][name] = 0
            volume_data[date][name] += volume

    return volume_data


def calculate_frequency_data(workouts):
    """
    Calcula la frecuencia de entrenamiento por ejercicio.

    Args:
        workouts (list): Lista de entrenamientos.

    Returns:
        dict: Frecuencia de entrenamiento para cada ejercicio.
    """
    if not isinstance(workouts, list):
        raise TypeError("workouts debe ser una lista de entrenamientos")

    frequency_map = {}
    for workout in workouts:
        for exercise in workout["exercises"]:
            name = exercise["name"]
            frequency_map[name] = frequency_map.get(name, 0) + 1
    return frequency_map


import json


def load_workouts_from_json():
    """Carga los entrenamientos desde el archivo JSON."""
    try:
        with open(WORKOUTS_JSON_PATH, "r") as file:
            data = json.load(file)
        # Asegurar que siempre se devuelva un diccionario con la clave "workouts"
        if isinstance(data, list):  # Si es una lista, convertirla a diccionario
            return {"workouts": data}
        elif isinstance(data, dict):  # Si ya es un diccionario, retornarlo directamente
            return data
        else:
            return {"workouts": []}  # Si no es ni lista ni diccionario, retornar vacío
    except FileNotFoundError:
        return {"workouts": []}


def load_data_rm_from_json():
    """Carga y asegura la estructura correcta del archivo data_rm.json."""
    try:
        with open(DATA_RM_JSON_PATH, "r") as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error cargando {DATA_RM_JSON_PATH}: {e}")
        data = {"initial_data": {}, "rm_records": []}

    # Asegurar estructura inicial_data
    if "initial_data" not in data or not isinstance(data["initial_data"], dict):
        data["initial_data"] = {}
    for key in ["id", "date", "pull_up_rm", "dip_rm", "squat_rm", "muscle_up_rm"]:
        if key not in data["initial_data"]:
            data["initial_data"][key] = "" if key == "date" else 0.0

    # Asegurar estructura de rm_records
    if "rm_records" not in data or not isinstance(data["rm_records"], list):
        data["rm_records"] = []

    for record in data["rm_records"]:
        for key in ["id", "date", "pull_up_rm", "dip_rm", "squat_rm", "muscle_up_rm"]:
            if key not in record:
                record[key] = (
                    str(uuid.uuid4()) if key == "id" else ("" if key == "date" else 0.0)
                )

    return data


def save_data_rm_to_json(data):
    """Guarda los datos en el archivo JSON de registros de RM."""
    try:
        with open(DATA_RM_JSON_PATH, "w") as file:
            json.dump(data, file, indent=4)
    except Exception as e:
        print(f"Error al guardar datos en {DATA_RM_JSON_PATH}: {e}")


def load_data_routines_from_json():
    """Carga y asegura la estructura correcta del archivo data_routines.json."""
    try:
        with open(DATA_ROUTINES_JSON_PATH, "r") as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {"routines": []}

    # Asegurar que 'routines' sea una lista
    if not isinstance(data.get("routines"), list):
        data["routines"] = []

    return data
