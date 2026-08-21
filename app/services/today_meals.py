from datetime import date

from app.services.meal_service import get_all_meals


def get_today_meals():
    """
    Return only today's meals.
    """
    today = date.today().isoformat()

    meals = get_all_meals()

    return [
        meal
        for meal in meals
        if meal[1] == today
    ]