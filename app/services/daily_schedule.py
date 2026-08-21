from datetime import date

from app.services.checkin_schedule import get_schedule_for_day_type
from app.services.day_type_service import get_day_type


def get_today_schedule():
    """
    Return today's schedule based on the resolved day type.
    """
    today = date.today()
    day_type = get_day_type(today)

    if day_type in {"leave", "travel", "custom"}:
        return {
            "date": today.isoformat(),
            "day_type": day_type,
            "schedule": [],
        }

    schedule = get_schedule_for_day_type(day_type)

    return {
        "date": today.isoformat(),
        "day_type": day_type,
        "schedule": schedule,
    }


def get_schedule_for_date(target_date):
    """
    Return the schedule for a specific date.
    """
    day_type = get_day_type(target_date)

    if day_type in {"leave", "travel", "custom"}:
        return {
            "date": target_date.isoformat(),
            "day_type": day_type,
            "schedule": [],
        }

    schedule = get_schedule_for_day_type(day_type)

    return {
        "date": target_date.isoformat(),
        "day_type": day_type,
        "schedule": schedule,
    }