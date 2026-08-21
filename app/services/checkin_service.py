from datetime import date, datetime

from app.database.database import (
    add_checkin,
    get_checkins,
    get_checkins_by_date,
    get_checkin_by_date_and_type,
    update_checkin,
    delete_checkin,
)
from app.services.daily_schedule import get_schedule_for_date


def record_checkin(
    checkin_date,
    checkin_type,
    scheduled_time,
    status,
    completed_at=None,
    notes=None,
):
    add_checkin(
        checkin_date=checkin_date,
        checkin_type=checkin_type,
        scheduled_time=scheduled_time,
        status=status,
        completed_at=completed_at,
        notes=notes,
    )


def get_all_checkins():
    return get_checkins()


def get_today_checkins(checkin_date=None):
    if checkin_date is None:
        checkin_date = date.today().isoformat()

    return get_checkins_by_date(checkin_date)


def create_today_checkins():
    today = date.today()
    today_value = today.isoformat()

    daily_schedule = get_schedule_for_date(today)

    created_count = 0

    for item in daily_schedule["schedule"]:
        existing = get_checkin_by_date_and_type(
            today_value,
            item["checkin_type"],
        )

        if existing:
            continue

        record_checkin(
            checkin_date=today_value,
            checkin_type=item["checkin_type"],
            scheduled_time=item["start_time"],
            status="pending",
        )

        created_count += 1

    return created_count


def complete_checkin(checkin_id, notes=None):
    return update_checkin(
        checkin_id=checkin_id,
        status="completed",
        completed_at=datetime.now().isoformat(),
        notes=notes,
    )


def edit_checkin(
    checkin_id,
    status=None,
    completed_at=None,
    notes=None,
):
    return update_checkin(
        checkin_id=checkin_id,
        status=status,
        completed_at=completed_at,
        notes=notes,
    )


def remove_checkin(checkin_id):
    return delete_checkin(checkin_id)