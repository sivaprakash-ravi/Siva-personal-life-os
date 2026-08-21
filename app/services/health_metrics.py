VALID_METRICS = {
    "sleep_hours": {
        "unit": "hours",
        "min": 0,
        "max": 24,
    },
    "weight": {
        "unit": "kg",
        "min": 0,
        "max": 500,
    },
    "water": {
        "unit": "ml",
        "min": 0,
        "max": 20000,
    },
    "steps": {
        "unit": "steps",
        "min": 0,
        "max": 100000,
    },
    "distance": {
        "unit": "km",
        "min": 0,
        "max": 500,
    },
    "active_calories": {
        "unit": "kcal",
        "min": 0,
        "max": 10000,
    },
    "heart_rate": {
        "unit": "bpm",
        "min": 20,
        "max": 250,
    },
    "resting_heart_rate": {
        "unit": "bpm",
        "min": 20,
        "max": 200,
    },
    "spo2": {
        "unit": "%",
        "min": 0,
        "max": 100,
    },
    "stress": {
        "unit": "score",
        "min": 0,
        "max": 100,
    },
    "energy": {
        "unit": "score",
        "min": 1,
        "max": 10,
    },
    "mood": {
        "unit": "score",
        "min": 1,
        "max": 10,
    },
    "exercise_minutes": {
        "unit": "minutes",
        "min": 0,
        "max": 1440,
    },
}


def validate_health_metric(metric_type, value):
    """
    Validate a health metric before storing it.
    """
    if metric_type not in VALID_METRICS:
        raise ValueError(
            f"Invalid health metric: {metric_type}. "
            f"Allowed metrics: {sorted(VALID_METRICS)}"
        )

    if value is None:
        raise ValueError("Health metric value cannot be empty.")

    rules = VALID_METRICS[metric_type]

    if value < rules["min"] or value > rules["max"]:
        raise ValueError(
            f"{metric_type} must be between "
            f"{rules['min']} and {rules['max']} {rules['unit']}."
        )

    return True


def get_metric_unit(metric_type):
    """
    Return the configured unit for a health metric.
    """
    if metric_type not in VALID_METRICS:
        raise ValueError(f"Invalid health metric: {metric_type}")

    return VALID_METRICS[metric_type]["unit"]