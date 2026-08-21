from datetime import date

from app.database.database import get_connection


def get_monthly_category_totals(year=None, month=None):
    today = date.today()

    year = year or today.year
    month = month or today.month

    month_prefix = f"{year:04d}-{month:02d}"

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            category,
            COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE substr(expense_date, 1, 7) = ?
        GROUP BY category
        ORDER BY SUM(amount) DESC
        """,
        (month_prefix,),
    ).fetchall()

    connection.close()

    return {
        row[0]: row[1]
        for row in rows
    }


def get_monthly_total(year=None, month=None):
    totals = get_monthly_category_totals(
        year,
        month,
    )

    return sum(totals.values())


def get_activity_spending(
    activity_type,
    year=None,
    month=None,
):
    today = date.today()

    year = year or today.year
    month = month or today.month

    month_prefix = f"{year:04d}-{month:02d}"

    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            COUNT(DISTINCT a.id),
            COALESCE(SUM(e.amount), 0)
        FROM activities a
        JOIN activity_expenses ae
            ON ae.activity_id = a.id
        JOIN expenses e
            ON e.id = ae.expense_id
        WHERE a.activity_type = ?
          AND substr(a.activity_date, 1, 7) = ?
        """,
        (
            activity_type,
            month_prefix,
        ),
    ).fetchone()

    connection.close()

    return {
        "activity_type": activity_type,
        "count": row[0],
        "total_amount": row[1],
    }


def get_top_spending_category(
    year=None,
    month=None,
):
    totals = get_monthly_category_totals(
        year,
        month,
    )

    if not totals:
        return None

    category = max(
        totals,
        key=totals.get,
    )

    return {
        "category": category,
        "amount": totals[category],
    }


def get_spending_insights():
    today = date.today()

    categories = get_monthly_category_totals(
        today.year,
        today.month,
    )

    insights = []

    if categories:
        top = max(
            categories,
            key=categories.get,
        )

        insights.append(
            f"You spent ₹{categories[top]:.0f} "
            f"on {top} this month."
        )

    for activity_type, label in [
        ("movie", "Movies"),
        ("game", "Games"),
        ("eating_out", "Eating out"),
    ]:
        activity = get_activity_spending(
            activity_type,
            today.year,
            today.month,
        )

        if activity["count"] > 0:
            insights.append(
                f"{label}: "
                f"{activity['count']} occasions, "
                f"₹{activity['total_amount']:.0f}."
            )

    return insights