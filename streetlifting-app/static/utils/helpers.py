def calculate_estimated_one_rm(weight, reps):
    if reps > 1:
        return round(weight * (1 + 0.0333 * reps), 2)
    return round(weight, 2)


def normalize_exercise_name(name):
    return name.strip().lower()
