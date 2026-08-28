from datetime import date, datetime

from app.services.daily_summary import get_daily_summary
from app.services.nutrition_summary import get_daily_nutrition_summary
from app.services.health_overview import get_health_overview
from app.services.expense_intelligence import get_daily_expense_summary
from app.services.activity_service import get_all_activities


def get_unified_life_record(record_date=None):
    # Normalize incoming date
    if record_date is None:
        target_date = date.today()

    elif isinstance(record_date, str):
        target_date = datetime.strptime(
            record_date,
            "%Y-%m-%d",
        ).date()

    elif isinstance(record_date, date):
        target_date = record_date

    else:
        raise TypeError(
            "record_date must be a date, "
            "YYYY-MM-DD string, or None."
        )

    date_value = target_date.isoformat()

    # Activities currently store dates as strings.
    activities = [
        activity
        for activity in get_all_activities()
        if activity[1] == date_value
    ]

    return {
        "date": date_value,

        "daily_life": get_daily_summary(
            target_date
        ),

        "health": get_health_overview(
            target_date
        ),

        "nutrition": get_daily_nutrition_summary(
            target_date
        ),

        "finance": get_daily_expense_summary(
            date_value
        ),

        "activities": activities,

        # V2 modules — intentionally empty for V1
        "learning": None,
        "gym": None,
    }