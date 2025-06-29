# utils/rm_calculator.py
from .common import calculate_estimated_one_rm


def calculate_hypothetical_rm(rm_records, one_rm_initial):
    """Calcula el 1RM hipotético basado en los entrenamientos."""
    hypothetical_one_rm = {
        exercise: one_rm_initial.get(exercise, 0) for exercise in one_rm_initial
    }

    for workout in rm_records:
        for exercise in workout["exercises"]:
            exercise_name = exercise["name"]
            weight = exercise["weight"]
            reps = exercise["reps"]

            # Calcular el nuevo 1RM estimado
            estimated_one_rm = calculate_estimated_one_rm(weight, reps)

            # Actualizar el 1RM hipotético solo si es mayor al inicial
            if (
                exercise_name in hypothetical_one_rm
                and estimated_one_rm > one_rm_initial.get(exercise_name, 0)
            ):
                hypothetical_one_rm[exercise_name] = max(
                    hypothetical_one_rm[exercise_name], estimated_one_rm
                )
    return hypothetical_one_rm
