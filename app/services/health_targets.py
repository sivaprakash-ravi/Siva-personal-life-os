from app.services.health_summary import get_daily_health_summary


DEFAULT_HEALTH_TARGETS = {
    "sleep_hours": 8,
    "water_ml": 2500,
    "steps": 8000,
    "exercise_minutes": 30,
}


def get_health_targets():
    """
    Return the configured daily health targets.
    """
    return DEFAULT_HEALTH_TARGETS.copy()


def calculate_health_progress(target_date=None):
    """
    Compare daily health metrics against configured targets.
    """
    summary = get_daily_health_summary(target_date)
    targets = get_health_targets()

    def percentage(value, target):
        if not target:
            return 0.0

        return round((value / target) * 100, 2)

    sleep = summary["sleep_hours"] or 0
    water = summary["water_ml"]
    steps = summary["steps"]
    exercise = summary["exercise_minutes"]

    return {
        "date": summary["date"],
        "sleep_hours": sleep,
        "sleep_target": targets["sleep_hours"],
        "sleep_percentage": percentage(
            sleep,
            targets["sleep_hours"],
        ),
        "water_ml": water,
        "water_target": targets["water_ml"],
        "water_percentage": percentage(
            water,
            targets["water_ml"],
        ),
        "steps": steps,
        "steps_target": targets["steps"],
        "steps_percentage": percentage(
            steps,
            targets["steps"],
        ),
        "exercise_minutes": exercise,
        "exercise_target": targets["exercise_minutes"],
        "exercise_percentage": percentage(
            exercise,
            targets["exercise_minutes"],
        ),
    }