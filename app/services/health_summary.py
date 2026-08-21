from datetime import date

from app.services.health_service import get_health_for_date


def get_daily_health_summary(target_date=None):
    """
    Return a complete health summary for a specific day.
    """
    if target_date is None:
        target_date = date.today()

    records = get_health_for_date(target_date)

    summary = {
        "date": target_date.isoformat(),
        "sleep_hours": None,
        "weight_kg": None,
        "water_ml": 0,
        "steps": 0,
        "distance_km": 0,
        "active_calories": 0,
        "heart_rate": None,
        "resting_heart_rate": None,
        "spo2": None,
        "stress": None,
        "energy": None,
        "mood": None,
        "exercise_minutes": 0,
    }

    for record in records:
        metric_type = record[2]
        value = record[3]

        if metric_type == "sleep_hours":
            summary["sleep_hours"] = value

        elif metric_type == "weight":
            summary["weight_kg"] = value

        elif metric_type == "water":
            summary["water_ml"] += value or 0

        elif metric_type == "steps":
            summary["steps"] += value or 0

        elif metric_type == "distance":
            summary["distance_km"] += value or 0

        elif metric_type == "active_calories":
            summary["active_calories"] += value or 0

        elif metric_type == "heart_rate":
            summary["heart_rate"] = value

        elif metric_type == "resting_heart_rate":
            summary["resting_heart_rate"] = value

        elif metric_type == "spo2":
            summary["spo2"] = value

        elif metric_type == "stress":
            summary["stress"] = value

        elif metric_type == "energy":
            summary["energy"] = value

        elif metric_type == "mood":
            summary["mood"] = value

        elif metric_type == "exercise_minutes":
            summary["exercise_minutes"] += value or 0

    return summary