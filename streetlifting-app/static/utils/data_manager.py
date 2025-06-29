import json
import os

# Rutas a los archivos JSON
FILES_PATHS = {
    "workouts": "static/utils/workouts.json",
    "data_rm": "static/utils/data_rm.json",
    "routines": "static/utils/routines.json",
    "user_data": "static/utils/user_data.json",
    "training_blocks": "static/utils/training_blocks.json",
}


def load_json(file_name):
    """Carga los datos de un archivo JSON, asegurando que exista."""
    path = FILES_PATHS[file_name]
    if not os.path.exists(path):
        print(f"El archivo {path} no existe. Inicialízalo primero.")
        return {}
    try:
        with open(path, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        print(f"El archivo {path} tiene un formato inválido. Inicialízalo primero.")
        return {}


def save_json(file_name, data):
    """Guarda los datos en un archivo JSON."""
    path = FILES_PATHS[file_name]
    with open(path, "w") as file:
        json.dump(data, file, indent=4)
    print(f"Datos guardados correctamente en {path}.")


def validate_json(file_name, initial_structure):
    """Valida y repara la estructura de un archivo JSON."""
    data = load_json(file_name)
    updated = False

    # Validar y reparar estructura
    for key, value in initial_structure.items():
        if key not in data:
            data[key] = value
            updated = True

    if updated:
        save_json(file_name, data)
        print(f"Estructura de {file_name} actualizada.")

    return data
