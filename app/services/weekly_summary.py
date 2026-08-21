from datetime import date, timedelta

from app.services.daily_summary import get_daily_summary
from app.services.streak import calculate_current_streak


def get_weekly_summary(end_date=None):
    """
    Calculate a summary for the seven-day period ending on end_date.
    """
    if end_date is None:
        end_date = date.today()

    start_date = end_date - timedelta(days=6)

    daily_summaries = []

    current_date = start_date

    while current_date <= end_date:
        daily_summaries.append(
            get_daily_summary(current_date)
        )
        current_date += timedelta(days=1)

    total = sum(summary["total"] for summary in daily_summaries)
    completed = sum(summary["completed"] for summary in daily_summaries)
    pending = sum(summary["pending"] for summary in daily_summaries)
    missed = sum(summary["missed"] for summary in daily_summaries)

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
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total": total,
        "completed": completed,
        "pending": pending,
        "missed": missed,
        "completion_rate": completion_rate,
        "best_day": best_day,
        "worst_day": worst_day,
        "current_streak": calculate_current_streak(end_date),
        "daily_summaries": daily_summaries,
    }