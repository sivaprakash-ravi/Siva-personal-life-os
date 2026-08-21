from datetime import date

from app.services.today_meals import get_today_meals


def calculate_daily_protein(target_date=None):
    """
    Calculate total protein recorded for a day.
    """
    if target_date is None:
        target_date = date.today()

    meals = get_today_meals() if target_date == date.today() else []

    return round(
        sum(
            meal[6]
            for meal in meals
            if meal[6] is not None
        ),
        2,
    )