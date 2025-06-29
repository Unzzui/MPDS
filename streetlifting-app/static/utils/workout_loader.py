import os
import json

WORKOUTS_FILE = "utils/workouts.json"


def load_workouts():
    """Carga los datos del archivo workouts.json, creando la estructura inicial si no existe."""
    if os.path.exists(WORKOUTS_FILE):
        try:
            with open(WORKOUTS_FILE, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            print(
                "El archivo workouts.json tiene un formato inválido. Inicializando..."
            )
    return {"workouts": []}


def save_workouts(data):
    """Guarda los datos en el archivo workouts.json."""
    with open(WORKOUTS_FILE, "w") as file:
        json.dump(data, file, indent=4)
