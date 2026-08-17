from app.database.database import (
    add_checkin,
    get_checkins,
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