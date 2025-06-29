from flask import Blueprint, render_template, request, redirect, url_for, flash
import json
from datetime import datetime

TRAINING_BLOCKS_FILE = "static/utils/training_blocks.json"

# Blueprint para manejar la proyección de bloques
projections_bp = Blueprint("projections", __name__)


# Función para cargar datos del bloque actual
def load_current_block():
    with open(TRAINING_BLOCKS_FILE, "r") as file:
        training_blocks = json.load(file)
        current_block = training_blocks["blocks"][-1]
    return current_block


# Función para calcular los pesos semanales
def calculate_weekly_weights(
    initial_rm, weekly_increment, weeks, increment_type="percentage"
):
    """
    Calcula los pesos semanales según el tipo de incremento (porcentual o absoluto).
    """
    weekly_weights = {}
    current_weight = initial_rm

    for week in range(1, weeks + 1):
        if increment_type == "percentage":
            weekly_weights[f"Semana {week}"] = round(current_weight, 2)
            current_weight += initial_rm * (weekly_increment / 100)
        elif increment_type == "absolute":
            weekly_weights[f"Semana {week}"] = round(current_weight, 2)
            current_weight += weekly_increment
        else:
            raise ValueError(
                "El tipo de incremento debe ser 'percentage' o 'absolute'."
            )

    return weekly_weights


# Función para generar la tabla de RPE
def generate_rpe_table(initial_rm, reps_range=12):
    rpe_multipliers = {
        10: [
            1.000,
            0.955,
            0.922,
            0.892,
            0.863,
            0.837,
            0.811,
            0.786,
            0.762,
            0.739,
            0.707,
            0.680,
        ],
        9.5: [
            0.978,
            0.939,
            0.907,
            0.878,
            0.850,
            0.824,
            0.799,
            0.774,
            0.751,
            0.723,
            0.694,
            0.667,
        ],
        9: [
            0.955,
            0.922,
            0.892,
            0.863,
            0.837,
            0.811,
            0.786,
            0.762,
            0.739,
            0.707,
            0.680,
            0.653,
        ],
        8.5: [
            0.939,
            0.907,
            0.878,
            0.850,
            0.824,
            0.799,
            0.774,
            0.751,
            0.723,
            0.694,
            0.667,
            0.640,
        ],
        8: [
            0.922,
            0.892,
            0.863,
            0.837,
            0.811,
            0.786,
            0.762,
            0.739,
            0.707,
            0.680,
            0.653,
            0.626,
        ],
        7.5: [
            0.907,
            0.878,
            0.850,
            0.824,
            0.799,
            0.774,
            0.751,
            0.723,
            0.694,
            0.667,
            0.640,
            0.613,
        ],
        7: [
            0.892,
            0.863,
            0.837,
            0.811,
            0.786,
            0.762,
            0.739,
            0.707,
            0.680,
            0.653,
            0.626,
            0.599,
        ],
    }

    rpe_table = {}
    for rpe, multipliers in rpe_multipliers.items():
        bw = 65
        # ((rm+bw)*multiplier)-bw

        rpe_table[f"RPE {rpe}"] = [
            round(((initial_rm + bw) * multiplier) - bw, 1)
            for multiplier in multipliers[:reps_range]
        ]
    return rpe_table


def generate_weekly_weights(block_data):
    if block_data["increment_type"] == "percentage":
        weekly_weights = {
            lift: {
                week: block_data[f"rm_{lift}"]
                * (1 + block_data["weekly_increment"] / 100) ** (week - 1)
                for week in range(1, block_data["duration"] + 1)
            }
            for lift in ["pullups", "dips", "muscleups", "squat"]
        }
    elif block_data["increment_type"] == "absolute":
        weekly_weights = {
            lift: {
                week: block_data[f"rm_{lift}"]
                + block_data["weekly_increment"] * (week - 1)
                for week in range(1, block_data["duration"] + 1)
            }
            for lift in ["pullups", "dips", "muscleups", "squat"]
        }
    return weekly_weights


@projections_bp.route("/current_block")
def current_block():
    block_data = load_current_block()

    if not block_data:
        flash("No hay un bloque actual disponible.", "info")
        return redirect(url_for("blocks.create_block"))

    # Generar los pesos semanales
    weekly_weights = generate_weekly_weights(block_data)

    # Generar las tablas de RPE para cada levantamiento
    rpe_tables = {
        "Pull-Ups": generate_rpe_table(block_data["rm_pullups"]),
        "Dips": generate_rpe_table(block_data["rm_dips"]),
        "Muscle-Ups": generate_rpe_table(block_data["rm_muscleups"]),
        "Squat": generate_rpe_table(block_data["rm_squats"]),
    }

    # Definir las repeticiones a calcular y el RPE utilizado
    reps_list = [3, 5, 8]
    rpe = 8

    # Generar el diccionario de progresión por repeticiones
    progression_by_reps = {}
    for lift, weekly_data in weekly_weights.items():
        progression_by_reps[lift] = {}
        for week, weight in weekly_data.items():
            progression_data = {}
            for reps in reps_list:
                rpe_multiplier = rpe_tables[lift][f"RPE {rpe}"][reps - 1]
                weight_at_reps = round(weight * rpe_multiplier, 2)
                progression_data[f"{reps} reps"] = weight_at_reps
            progression_by_reps[lift][f"Semana {week}"] = progression_data

    return render_template(
        "blocks/current_block.html",
        weekly_projections=weekly_weights,
        rpe_tables=rpe_tables,
        progression_by_reps=progression_by_reps,
        block=block_data,
    )
