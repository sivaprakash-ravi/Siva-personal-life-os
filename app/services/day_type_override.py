from datetime import date, timedelta

from app.database.day_type_database import (
    set_day_type_override,
    delete_day_type_override,
)


ALLOWED_DAY_TYPES = {
    "leave",
    "travel",
    "custom",
}


def set_override(target_date, day_type, notes=None):
    """
    Set or update a user's day-type override.
    """
    if day_type not in ALLOWED_DAY_TYPES:
        raise ValueError(
            f"Invalid day type: {day_type}. "
            f"Allowed types: {sorted(ALLOWED_DAY_TYPES)}"
        )

    set_day_type_override(
        override_date=target_date.isoformat(),
        day_type=day_type,
        notes=notes,
    )


def set_today_leave(notes=None):
    """
    Mark today as a leave day.
    """
    set_override(
        target_date=date.today(),
        day_type="leave",
        notes=notes,
    )


def set_tomorrow_leave(notes=None):
    """
    Mark tomorrow as a leave day.
    """
    set_override(
        target_date=date.today() + timedelta(days=1),
        day_type="leave",
        notes=notes,
    )


def clear_override(target_date):
    """
    Remove a user's day-type override.
    """
    return delete_day_type_override(target_date.isoformat())