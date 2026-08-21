from app.services.daily_summary import get_daily_summary


def calculate_consistency_score(summary=None):
    """
    Calculate a simple daily consistency score.

    Score = completed check-ins / total check-ins * 100.
    """
    if summary is None:
        summary = get_daily_summary()

    total = summary["total"]

    if total == 0:
        return 0.0

    completed = summary["completed"]

    return round((completed / total) * 100, 2)