from datetime import date, datetime, time

from app.services.checkin_service import get_today_checkins


def get_missed_checkins(check_ins, current_time=None):
    """
    Return pending check-ins whose scheduled time has passed.

    Completed check-ins are never considered missed.
    Future check-ins remain pending.
    """
    if current_time is None:
        current_time = datetime.now().time()

    missed_checkins = []

    for check_in in check_ins:
        status = check_in[5]
        scheduled_time = check_in[3]

        if status != "pending":
            continue

        if not scheduled_time:
            continue

        scheduled = time.fromisoformat(scheduled_time)

        if scheduled < current_time:
            missed_checkins.append(check_in)

    return missed_checkins


def get_today_missed_checkins(current_time=None):
    """
    Return today's check-ins that are currently considered missed.
    """
    today = date.today().isoformat()
    today_check_ins = get_today_checkins(today)

    return get_missed_checkins(
        today_check_ins,
        current_time=current_time,
    )