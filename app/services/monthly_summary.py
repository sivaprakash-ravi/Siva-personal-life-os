from datetime import date, timedelta

from app.services.daily_summary import get_daily_summary
from app.services.streak import calculate_current_streak


def get_monthly_summary(year=None, month=None):
    """
    Calculate a summary for a calendar month.
    """
    today = date.today()

    if year is None:
        year = today.year

    if month is None:
        month = today.month

    first_day = date(year, month, 1)

    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)

    last_day = next_month - timedelta(days=1)

    daily_summaries = []

    current_date = first_day

    while current_date <= last_day:
        daily_summaries.append(
            get_daily_summary(current_date)
        )
        current_date += timedelta(days=1)

    total = sum(
        summary["total"]
        for summary in daily_summaries
    )

    completed = sum(
        summary["completed"]
        for summary in daily_summaries
    )

    pending = sum(
        summary["pending"]
        for summary in daily_summaries
    )

    missed = sum(
        summary["missed"]
        for summary in daily_summaries
    )

    completion_rate = (
        round((completed / total) * 100, 2)
        if total
        else 0.0
    )

    days_with_data = [
        summary
        for summary in daily_summaries
        if summary["total"] > 0
    ]

    best_day = None
    worst_day = None

    if days_with_data:
        best_day = max(
            days_with_data,
            key=lambda summary: summary["completion_rate"],
        )

        worst_day = min(
            days_with_data,
            key=lambda summary: summary["completion_rate"],
        )

    return {
        "year": year,
        "month": month,
        "start_date": first_day.isoformat(),
        "end_date": last_day.isoformat(),
        "total": total,
        "completed": completed,
        "pending": pending,
        "missed": missed,
        "completion_rate": completion_rate,
        "best_day": best_day,
        "worst_day": worst_day,
        "current_streak": calculate_current_streak(last_day),
        "daily_summaries": daily_summaries,
    }