from datetime import date

from app.database.database import get_connection


def get_daily_expense_summary(expense_date=None):
    if expense_date is None:
        expense_date = date.today().isoformat()

    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            COUNT(*),
            COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE expense_date = ?
        """,
        (expense_date,),
    ).fetchone()

    connection.close()

    return {
        "date": expense_date,
        "expense_count": row[0],
        "total_amount": row[1],
    }


def get_monthly_expense_summary(year=None, month=None):
    today = date.today()

    if year is None:
        year = today.year

    if month is None:
        month = today.month

    month_prefix = f"{year:04d}-{month:02d}"

    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            COUNT(*),
            COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE substr(expense_date, 1, 7) = ?
        """,
        (month_prefix,),
    ).fetchone()

    connection.close()

    return {
        "year": year,
        "month": month,
        "expense_count": row[0],
        "total_amount": row[1],
    }


def get_category_spending(
    year=None,
    month=None,
):
    today = date.today()

    if year is None:
        year = today.year

    if month is None:
        month = today.month

    month_prefix = f"{year:04d}-{month:02d}"

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            category,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(*) AS expense_count
        FROM expenses
        WHERE substr(expense_date, 1, 7) = ?
        GROUP BY category
        ORDER BY total_amount DESC
        """,
        (month_prefix,),
    ).fetchall()

    connection.close()

    return [
        {
            "category": row[0],
            "total_amount": row[1],
            "expense_count": row[2],
        }
        for row in rows
    ]


def get_subcategory_spending(
    category,
    year=None,
    month=None,
):
    today = date.today()

    if year is None:
        year = today.year

    if month is None:
        month = today.month

    month_prefix = f"{year:04d}-{month:02d}"

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            subcategory,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(*) AS expense_count
        FROM expenses
        WHERE substr(expense_date, 1, 7) = ?
          AND category = ?
        GROUP BY subcategory
        ORDER BY total_amount DESC
        """,
        (
            month_prefix,
            category,
        ),
    ).fetchall()

    connection.close()

    return [
        {
            "subcategory": row[0],
            "total_amount": row[1],
            "expense_count": row[2],
        }
        for row in rows
    ]