from app.services.health_summary import get_daily_health_summary
from app.services.health_targets import calculate_health_progress


def get_health_overview(target_date=None):
    """
    Return today's health data together with target progress.
    """
    summary = get_daily_health_summary(target_date)
    progress = calculate_health_progress(target_date)

    return {
        "date": summary["date"],
        "metrics": summary,
        "progress": progress,
    }