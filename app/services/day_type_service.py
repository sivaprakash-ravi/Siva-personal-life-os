from datetime import date

from app.database.day_type_database import get_day_type_override
from app.services.checkin_schedule import get_default_day_type


def get_day_type(target_date=None):
    """
    Determine the day type for a given date.

    Priority:
    1. User-defined override
    2. Fixed weekly schedule
    3. Normal workday
    """
    if target_date is None:
        target_date = date.today()

    date_value = target_date.isoformat()

    override = get_day_type_override(date_value)

    if override:
        return override[2]

    day_name = target_date.strftime("%A")

    return get_default_day_type(day_name)