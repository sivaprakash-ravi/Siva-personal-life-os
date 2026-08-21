from datetime import date

from app.services.today_meals import get_today_meals


EXPECTED_MEALS = {
    "breakfast",
    "lunch",
    "dinner",
}


def get_meal_completion(target_date=None):
    """
    Determine which expected meals were recorded for a day.
    """
    if target_date is None:
        target_date = date.today()

    meals = get_today_meals()

    recorded_meal_types = {
        meal[2].lower()
        for meal in meals
        if meal[2]
    }

    completed = sorted(
        EXPECTED_MEALS.intersection(recorded_meal_types)
    )

    pending = sorted(
        EXPECTED_MEALS.difference(recorded_meal_types)
    )

    return {
        "date": target_date.isoformat(),
        "expected": len(EXPECTED_MEALS),
        "completed": len(completed),
        "pending": len(pending),
        "completed_meals": completed,
        "pending_meals": pending,
        "completion_rate": round(
            (len(completed) / len(EXPECTED_MEALS)) * 100,
            2,
        ),
    }