# data_loader.py
import os
import json

DATA_RM_FILE = "utils/data_rm.json"


def load_rm_data():
    """Carga los datos del archivo data_rm.json, creando la estructura inicial si no existe."""
    if os.path.exists(DATA_RM_FILE):
        try:
            with open(DATA_RM_FILE, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            print("El archivo data_rm.json tiene un formato inválido. Inicializando...")
    # Si el archivo no existe o tiene un formato inválido, inicializar la estructura
    return {
        "initial_data": {},  # Datos iniciales de 1RM
        "rm_records": [],  # Registros de progresos de 1RM
    }


def save_rm_data(data):
    """Guarda los datos en el archivo data_rm.json."""
    with open(DATA_RM_FILE, "w") as file:
        json.dump(data, file, indent=4)


def validate_rm_data(data):
    """Valida y asegura que la estructura del archivo JSON sea correcta."""
    updated = False
    if "initial_data" not in data:
        data["initial_data"] = {}
        updated = True
    if "rm_records" not in data:
        data["rm_records"] = []
        updated = True
    return data, updated
