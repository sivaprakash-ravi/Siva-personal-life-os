from app.services.checkin_service import edit_checkin
from app.services.missed_checkin import get_today_missed_checkins


def evaluate_today_checkins():
    """
    Evaluate today's pending check-ins.

    Any pending check-in whose scheduled time has already passed
    is updated to 'missed'.

    Returns the number of check-ins marked as missed.
    """
    missed_check_ins = get_today_missed_checkins()

    updated_count = 0

    for check_in in missed_check_ins:
        checkin_id = check_in[0]

        rows_updated = edit_checkin(
            checkin_id=checkin_id,
            status="missed",
        )

        if rows_updated:
            updated_count += 1

    return updated_count