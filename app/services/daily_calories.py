from datetime import date

from app.services.today_meals import get_today_meals


def calculate_daily_calories(target_date=None):
    """
    Calculate the total calories recorded for a day.
    """
    if target_date is None:
        target_date = date.today()

    meals = get_today_meals() if target_date == date.today() else []

    return sum(
        meal[5]
        for meal in meals
        if meal[5] is not None
    )