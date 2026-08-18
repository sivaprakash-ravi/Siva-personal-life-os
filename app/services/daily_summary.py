from datetime import date

from app.services.checkin_service import get_today_checkins


def calculate_completion_rate(check_ins):
    """
    Calculate the completion rate from a list of check-in records.

    Completion rate = completed check-ins / total check-ins * 100.

    Returns 0.0 when there are no check-ins.
    """
    if not check_ins:
        return 0.0

    completed_count = sum(
        1
        for check_in in check_ins
        if check_in[5] == "completed"
    )

    return round((completed_count / len(check_ins)) * 100, 2)


def calculate_today_completion_rate():
    """
    Calculate today's check-in completion rate.
    """
    today = date.today().isoformat()
    today_check_ins = get_today_checkins(today)

    return calculate_completion_rate(today_check_ins)