from datetime import date, timedelta

from app.services.daily_summary import get_daily_summary


def calculate_current_streak(end_date=None):
    """
    Calculate the current consecutive-day streak.

    A day counts when all check-ins for that day are completed.
    A day with no check-ins does not count.
    """
    if end_date is None:
        end_date = date.today()

    streak = 0
    current_date = end_date

    while True:
        summary = get_daily_summary(current_date)

        if summary["total"] == 0:
            break

        if summary["completion_rate"] != 100.0:
            break

        streak += 1
        current_date -= timedelta(days=1)

    return streak