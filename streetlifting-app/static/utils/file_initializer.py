import json
import os

# Rutas de los archivos JSON
FILES_PATHS = {
    "workouts": "static/utils/workouts.json",
    "data_rm": "static/utils/data_rm.json",
    "routines": "static/utils/routines.json",
    "user_data": "static/utils/user_data.json",
    "training_blocks": "static/utils/training_blocks.json",
}

# Estructuras iniciales de cada archivo
INITIAL_STRUCTURES = {
    "workouts": {"workouts": []},
    "data_rm": {
        "initial_data": {
            "id": "",
            "date": "",
            "pull_up_rm": 0.0,
            "dip_rm": 0.0,
            "squat_rm": 0.0,
            "muscle_up_rm": 0.0,
        },
        "rm_records": [],
    },
    "routines": {
        "routines": [
            {
                "name": "Primary Pull",
                "exercises": ["Pull-Up", "Gironda Row", "One-Arm Pulldown"],
            },
            {
                "name": "Primary Push",
                "exercises": [
                    "Weighted Dips",
                    "Incline Bench Press",
                    "Tricep Extensions",
                ],
            },
            {
                "name": "Leg Day",
                "exercises": ["Back Squat", "Romanian Deadlift", "Lunges"],
            },
        ]
    },
    "user_data": {
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
    },
    "training_blocks": {"blocks": []},
}


PATH_EXERCISES = "static/utils/exercises.json"


def initialize_file(file_name):
    """Verifica y asegura que un archivo JSON tenga la estructura correcta."""
    path = FILES_PATHS[file_name]
    initial_structure = INITIAL_STRUCTURES[file_name]

    # Verificar si el archivo existe
    if not os.path.exists(path):
        print(f"El archivo {path} no existe. Creándolo...")
        with open(path, "w") as file:
            json.dump(initial_structure, file, indent=4)
        print(f"Archivo {path} creado con la estructura inicial.")
        return

    # Verificar si el archivo está vacío o no tiene la estructura adecuada
    try:
        with open(path, "r") as file:
            data = json.load(file)
        # Validar estructura básica
        if not isinstance(data, type(initial_structure)):
            raise ValueError("Estructura inválida")
    except (json.JSONDecodeError, ValueError):
        print(
            f"El archivo {path} está vacío o tiene una estructura inválida. Reestableciendo..."
        )
        with open(path, "w") as file:
            json.dump(initial_structure, file, indent=4)
        print(f"Estructura del archivo {path} reestablecida.")


def initialize_all_files():
    """Inicializa todos los archivos necesarios."""
    for file_name in FILES_PATHS.keys():
        initialize_file(file_name)


def remove_duplicates_and_sort_exercises():
    """Elimina duplicados y ordena alfabéticamente los ejercicios en el archivo exercises.json."""
    file_path = PATH_EXERCISES
    # Leer el archivo exercises.json
    with open(file_path, "r") as file:
        exercises = json.load(file)

    # Eliminar duplicados y ordenar alfabéticamente
    unique_exercises = sorted(set(exercises))

    # Escribir el archivo exercises.json con datos únicos y ordenados
    with open(file_path, "w") as file:
        json.dump(unique_exercises, file, indent=4)
    print(f"Duplicados eliminados y ejercicios ordenados en {file_path}.")


# Inicializar archivos y eliminar duplicados de exercises.json
initialize_all_files()
remove_duplicates_and_sort_exercises()
