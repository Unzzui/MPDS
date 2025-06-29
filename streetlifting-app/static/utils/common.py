def calculate_estimated_one_rm(weight, reps):
    """Calcula el 1RM estimado basado en el peso y las repeticiones."""
    if reps > 1:
        bw = 65
        return round(((bw + weight) * (1 + 0.0333 * reps)) - bw, 2)
    return round(weight, 2)


# ((bw + peso) × (1 + 0.0333 × reps)) - bw
