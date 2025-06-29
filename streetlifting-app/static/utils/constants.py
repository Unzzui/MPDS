# utils/constants.py

PREDEFINED_ROUTINES = {
    "Primary Pull": [
        "Pull-Up",
        "Gironda Row",
        "Unilateral Pulldown",
        "Barbell Curl (EZ Bar)",
        "Wrist Curl",
        "Hammer Curl",
    ],
    "Secondary Pull": [
        "Pull-Up",
        "Gironda Row",
        "Unilateral Pulldown",
        "Barbell Curl (EZ Bar)",
        "Wrist Curl",
        "Hammer Curl",
    ],
    "Primary Squat": ["Back Squat", "Leg Curl", "Leg Extension"],
    "Primary Dips": [
        "Weighted Dips",
        "Military Press",
        "Unilateral Triceps Extension",
        "Flat Bench Press",
    ],
    "Secondary Dips": [
        "Weighted Dips",
        "Military Press",
        "Unilateral Triceps Extension",
        "Flat Bench Press",
        "Incline Bench Press",
        "Lateral Raises",
    ],
}

DAY_TO_ROUTINE = {
    0: "Rest",
    1: "Primary Pull",
    2: "Primary Squat",
    3: "Primary Dips",
    4: "Secondary Pull",
    5: "Secondary Dips",
    6: "Rest",
}

EXERCISE_NAME_MAP = {
    "pull_up_rm": "Pull-Up",
    "dip_rm": "Weighted Dips",
    "squat_rm": "Back Squat",
    "muscle_up_rm": "Muscle-ups",
}


MAIN_LIFTS = ["Pull-Up", "Weighted Dips", "Squat", "Muscle-Up"]
