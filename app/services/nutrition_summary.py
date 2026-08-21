from datetime import date

from app.services.daily_calories import calculate_daily_calories
from app.services.daily_protein import calculate_daily_protein
from app.services.meal_completion import get_meal_completion


def get_daily_nutrition_summary(target_date=None):
    """
    Return a complete nutrition summary for a day.
    """
    if target_date is None:
        target_date = date.today()

    meal_completion = get_meal_completion(target_date)

    return {
        "date": target_date.isoformat(),
        "calories": calculate_daily_calories(target_date),
        "protein_grams": calculate_daily_protein(target_date),
        "meals_expected": meal_completion["expected"],
        "meals_completed": meal_completion["completed"],
        "meals_pending": meal_completion["pending"],
        "completed_meals": meal_completion["completed_meals"],
        "pending_meals": meal_completion["pending_meals"],
        "meal_completion_rate": meal_completion["completion_rate"],
    }