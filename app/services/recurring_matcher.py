from datetime import date

from app.database.database import get_connection
from app.services.recurring_service import confirm_recurring_payment


def find_matching_expense(
    recurring_id,
    payment_date=None,
    tolerance_days=5,
):
    if payment_date is None:
        payment_date = date.today().isoformat()

    connection = get_connection()

    recurring = connection.execute(
        """
        SELECT
            id,
            name,
            expected_amount,
            last_confirmed_date
        FROM recurring_payments
        WHERE id = ?
        AND active = 1
        """,
        (recurring_id,),
    ).fetchone()

    if not recurring:
        connection.close()
        return None

    name = recurring[1]
    expected_amount = recurring[2]

    rows = connection.execute(
        """
        SELECT
            id,
            expense_date,
            amount,
            description,
            merchant,
            source
        FROM expenses
        WHERE expense_date BETWEEN
              date(?, ?)
              AND date(?, ?)
        ORDER BY expense_date DESC
        """,
        (
            payment_date,
            f"-{tolerance_days} days",
            payment_date,
            f"+{tolerance_days} days",
        ),
    ).fetchall()

    connection.close()

    name_lower = name.lower()

    candidates = []

    for row in rows:
        expense_id = row[0]
        amount = row[2]
        description = row[3] or ""
        merchant = row[4] or ""

        text = (
            f"{description} {merchant}"
        ).lower()

        name_match = (
            name_lower in text
            or text in name_lower
        )

        amount_match = (
            expected_amount is None
            or abs(amount - expected_amount)
            <= max(expected_amount * 0.10, 5)
        )

        if name_match and amount_match:
            candidates.append({
                "expense_id": expense_id,
                "expense_date": row[1],
                "amount": amount,
                "description": description,
                "merchant": merchant,
                "source": row[5],
            })

    return candidates


def confirm_from_matching_expense(
    recurring_id,
    expense_id,
):
    connection = get_connection()

    expense = connection.execute(
        """
        SELECT
            id,
            expense_date,
            amount
        FROM expenses
        WHERE id = ?
        """,
        (expense_id,),
    ).fetchone()

    connection.close()

    if not expense:
        raise ValueError(
            f"Expense not found: {expense_id}"
        )

    confirm_recurring_payment(
        recurring_id=recurring_id,
        payment_date=expense[1],
        amount=expense[2],
    )

    return {
        "recurring_id": recurring_id,
        "expense_id": expense[0],
        "confirmed_date": expense[1],
        "amount": expense[2],
        "status": "renewed",
    }