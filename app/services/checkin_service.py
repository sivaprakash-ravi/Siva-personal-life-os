from datetime import datetime

from app.database.database import (
    add_checkin,
    get_checkins,
    get_checkins_by_date,
    get_checkin_by_date_and_type,
    update_checkin,
    delete_checkin,
)


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


def get_today_checkins(checkin_date):
    return get_checkins_by_date(checkin_date)


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


def complete_checkin(checkin_id, notes=None):
    completed_at = datetime.now().isoformat(timespec="seconds")

    return update_checkin(
        checkin_id=checkin_id,
        status="completed",
        completed_at=completed_at,
        notes=notes,
    )


def remove_checkin(checkin_id):
    return delete_checkin(checkin_id)


def create_today_checkins(schedule):
    created_count = 0

    for checkin in schedule:
        existing_checkin = get_checkin_by_date_and_type(
            checkin_date=checkin["checkin_date"],
            checkin_type=checkin["checkin_type"],
        )

        if existing_checkin is not None:
            continue

        record_checkin(
            checkin_date=checkin["checkin_date"],
            checkin_type=checkin["checkin_type"],
            scheduled_time=checkin["scheduled_time"],
            status="pending",
            notes=checkin["description"],
        )

        created_count += 1

    return created_count