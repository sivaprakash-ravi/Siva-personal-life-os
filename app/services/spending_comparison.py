from datetime import date

from app.services.spending_insights import (
    get_monthly_category_totals,
)


def get_previous_month(year, month):
    if month == 1:
        return year - 1, 12

    return year, month - 1


def compare_category_with_previous_month(
    category,
    year=None,
    month=None,
):
    today = date.today()

    year = year or today.year
    month = month or today.month

    previous_year, previous_month = get_previous_month(
        year,
        month,
    )

    current_totals = get_monthly_category_totals(
        year,
        month,
    )

    previous_totals = get_monthly_category_totals(
        previous_year,
        previous_month,
    )

    current_amount = current_totals.get(
        category,
        0,
    )

    previous_amount = previous_totals.get(
        category,
        0,
    )

    if previous_amount == 0:
        percentage_change = None
    else:
        percentage_change = (
            (current_amount - previous_amount)
            / previous_amount
        ) * 100

    if current_amount > previous_amount:
        direction = "increased"
    elif current_amount < previous_amount:
        direction = "decreased"
    else:
        direction = "unchanged"

    return {
        "category": category,
        "current_amount": current_amount,
        "previous_amount": previous_amount,
        "percentage_change": percentage_change,
        "direction": direction,
    }


def get_category_comparisons(
    year=None,
    month=None,
):
    today = date.today()

    year = year or today.year
    month = month or today.month

    current = get_monthly_category_totals(
        year,
        month,
    )

    previous_year, previous_month = get_previous_month(
        year,
        month,
    )

    previous = get_monthly_category_totals(
        previous_year,
        previous_month,
    )

    categories = set(current) | set(previous)

    comparisons = []

    for category in categories:
        result = compare_category_with_previous_month(
            category,
            year,
            month,
        )

        comparisons.append(result)

    return sorted(
        comparisons,
        key=lambda item: abs(
            item["percentage_change"] or 0
        ),
        reverse=True,
    )


def get_spending_change_message(category):
    result = compare_category_with_previous_month(
        category
    )

    if result["previous_amount"] == 0:
        if result["current_amount"] > 0:
            return (
                f"You spent ₹{result['current_amount']:.0f} "
                f"on {category} this month; "
                f"there was no spending in this category "
                f"last month."
            )

        return None

    change = abs(result["percentage_change"])

    if result["direction"] == "increased":
        return (
            f"📈 {category.capitalize()} spending increased "
            f"by {change:.0f}% compared with last month."
        )

    if result["direction"] == "decreased":
        return (
            f"📉 {category.capitalize()} spending decreased "
            f"by {change:.0f}% compared with last month."
        )

    return (
        f"➡️ {category.capitalize()} spending is "
        f"unchanged compared with last month."
    )