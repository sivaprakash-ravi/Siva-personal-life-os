from datetime import date

from app.services.checkin_service import get_today_checkins
from app.services.missed_checkin import get_missed_checkins


def calculate_completion_rate(check_ins):
    """
    Calculate completion percentage.

    Completed check-ins / total check-ins * 100.
    """
    if not check_ins:
        return 0.0

    completed_count = sum(
        1
        for check_in in check_ins
        if check_in[5] == "completed"
    )

    return round((completed_count / len(check_ins)) * 100, 2)


def get_daily_summary(summary_date=None):
    """
    Return a summary for a specific date.
    """
    if summary_date is None:
        summary_date = date.today()

    date_value = summary_date.isoformat()

    check_ins = get_today_checkins(date_value)

    missed_check_ins = get_missed_checkins(
        check_ins,
        __import__("datetime").datetime.now().time(),
    )

    missed_ids = {check_in[0] for check_in in missed_check_ins}

    completed = sum(
        1
        for check_in in check_ins
        if check_in[5] == "completed"
    )

    missed = sum(
        1
        for check_in in check_ins
        if check_in[0] in missed_ids or check_in[5] == "missed"
    )

    pending = sum(
        1
        for check_in in check_ins
        if check_in[5] == "pending" and check_in[0] not in missed_ids
    )

    return {
        "date": date_value,
        "total": len(check_ins),
        "completed": completed,
        "pending": pending,
        "missed": missed,
        "completion_rate": calculate_completion_rate(check_ins),
    }


def calculate_today_completion_rate():
    """
    Calculate today's completion rate.
    """
    summary = get_daily_summary()

    return summary["completion_rate"]