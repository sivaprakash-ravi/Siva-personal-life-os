"""
Canonical per-day "overall daily completion".

SIVA OS V1 defines overall daily progress as the unweighted average of the
daily-life domains that actually have measurable data on the day:

  - daily:     scheduled check-ins completed / total
  - health:    average of recorded health metrics against their targets
  - nutrition: expected meals (breakfast/lunch/dinner) recorded
  - activity:  intentionally NOT measurable -- leisure/event tracking only

Finance is deliberately excluded: spending is a record, not a completion goal.

Requirements honoured here:
  * Deterministic and explainable -- every number traces back to stored rows.
  * Real data only -- missing signals are excluded from the denominator, never
    fabricated into a "nice" percentage.
  * Availability is per-domain: a domain with no recorded data for the day is
    reported as unavailable instead of scoring zero.
  * Single source of truth for the web client, native client and reports.
"""

from datetime import date, datetime

from app.database.meal_database import get_meals
from app.services.daily_summary import get_daily_summary
from app.services.health_summary import get_daily_health_summary
from app.services.health_targets import get_health_targets
from app.services.meal_completion import EXPECTED_MEALS

COMPLETION_DOMAINS = ("daily", "health", "nutrition", "activity")

ACTIVITY_UNAVAILABLE_NOTE = (
    "Activity tracks leisure events and has no measurable daily "
    "completion target."
)


def _to_date(value):
    """Accept None, a date/datetime, or a YYYY-MM-DD string."""
    if value is None:
        return date.today()
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


def _metric_percentage(value, target):
    """Contribution of one metric toward its target, capped at 100."""
    if value is None or target is None or target <= 0:
        return None
    return min(round((value / target) * 100.0, 2), 100.0)


def _daily_domain(target_date, date_value):
    summary = get_daily_summary(target_date)

    available = summary["total"] > 0

    return {
        "available": available,
        "percentage": (
            summary["completion_rate"] if available else None
        ),
        "total": summary["total"],
        "completed": summary["completed"],
        "pending": summary["pending"],
        "missed": summary["missed"],
        "note": None if available else "No check-ins scheduled for this day.",
    }


def _health_domain(target_date):
    summary = get_daily_health_summary(target_date)
    targets = get_health_targets()

    metrics = [
        (
            "sleep_hours",
            summary["sleep_hours"],
            targets["sleep_hours"],
        ),
        (
            "water_ml",
            summary["water_ml"],
            targets["water_ml"],
        ),
        (
            "steps",
            summary["steps"],
            targets["steps"],
        ),
        (
            "exercise_minutes",
            summary["exercise_minutes"],
            targets["exercise_minutes"],
        ),
    ]

    recorded = [
        (key, value, target)
        for key, value, target in metrics
        if (value is not None and value > 0)
    ]

    if not recorded:
        return {
            "available": False,
            "percentage": None,
            "metrics_recorded": 0,
            "sleep_hours": summary["sleep_hours"],
            "water_ml": summary["water_ml"],
            "steps": summary["steps"],
            "exercise_minutes": summary["exercise_minutes"],
            "note": "No health data recorded for this day.",
        }

    percentages = [
        percentage
        for percentage in (
            _metric_percentage(value, target)
            for _, value, target in recorded
        )
        if percentage is not None
    ]

    return {
        "available": True,
        "percentage": (
            round(sum(percentages) / len(percentages), 2)
            if percentages
            else None
        ),
        "metrics_recorded": len(recorded),
        "sleep_hours": summary["sleep_hours"],
        "water_ml": summary["water_ml"],
        "steps": summary["steps"],
        "exercise_minutes": summary["exercise_minutes"],
        "note": None,
    }


def _nutrition_domain(date_value):
    # Read meals directly per-day: the V1 helpers (calculate_daily_calories /
    # meal_completion) only consider today, which would corrupt historical
    # reports. The meals table is always keyed by meal_date.
    meals = [meal for meal in get_meals() if meal[1] == date_value]

    recorded_types = {
        meal[2].lower()
        for meal in meals
        if meal[2]
    }

    available = bool(recorded_types)

    completed = len(EXPECTED_MEALS.intersection(recorded_types))
    expected = len(EXPECTED_MEALS)

    percentage = (
        round((completed / expected) * 100.0, 2) if available else None
    )

    return {
        "available": available,
        "percentage": percentage,
        "meals_completed": completed,
        "meals_expected": expected,
        "calories": sum(
            meal[5]
            for meal in meals
            if len(meal) > 5 and isinstance(meal[5], (int, float))
        ),
        "protein_grams": round(
            sum(
                meal[6]
                for meal in meals
                if len(meal) > 6 and isinstance(meal[6], (int, float))
            ),
            2,
        ),
        "note": (
            None
            if available
            else "No meals logged for this day."
        ),
    }


def _activity_domain():
    return {
        "available": False,
        "percentage": None,
        "note": ACTIVITY_UNAVAILABLE_NOTE,
    }


def get_daily_overview(target_date=None):
    """
    Return the canonical overall completion overview for a day.

    `percentage` is the unweighted average of the domains that have
    measurable data; it is None when no domain has data.
    """
    target_date = _to_date(target_date)
    date_value = target_date.isoformat()

    domains = {
        "daily": _daily_domain(target_date, date_value),
        "health": _health_domain(target_date),
        "nutrition": _nutrition_domain(date_value),
        "activity": _activity_domain(),
    }

    available = [
        domain
        for domain in domains.values()
        if domain["available"]
    ]

    percentages = [
        domain["percentage"]
        for domain in available
        if domain["percentage"] is not None
    ]

    return {
        "date": date_value,
        "percentage": (
            round(sum(percentages) / len(percentages), 2)
            if percentages
            else None
        ),
        "domains": domains,
    }