from datetime import date

from app.database.database import get_connection


def match_recurring_payment(
    recurring_id,
    transaction_date=None,
    amount=None,
    merchant=None,
    description=None,
):
    if transaction_date is None:
        transaction_date = date.today().isoformat()

    connection = get_connection()

    recurring = connection.execute(
        """
        SELECT
            id,
            name,
            expected_amount,
            next_expected_date
        FROM recurring_payments
        WHERE id = ?
        AND active = 1
        """,
        (recurring_id,),
    ).fetchone()

    connection.close()

    if not recurring:
        return {
            "status": "no_match",
            "reason": "recurring_payment_not_found",
        }

    name = recurring[1]
    expected_amount = recurring[2]
    expected_date = recurring[3]

    score = 0

    name_text = name.lower()
    merchant_text = (merchant or "").lower()
    description_text = (description or "").lower()

    # Strong identity signal
    if name_text and (
        name_text in merchant_text
        or name_text in description_text
    ):
        score += 60

    # Amount signal
    if (
        expected_amount is not None
        and amount is not None
    ):
        tolerance = max(
            expected_amount * 0.10,
            5,
        )

        if abs(
            amount - expected_amount
        ) <= tolerance:
            score += 30

    # Date signal
    if expected_date:
        expected = date.fromisoformat(
            expected_date
        )
        actual = date.fromisoformat(
            transaction_date
        )

        days_difference = abs(
            (actual - expected).days
        )

        if days_difference <= 3:
            score += 10

    if score >= 80:
        status = "strong_match"
    elif score >= 40:
        status = "possible_match"
    else:
        status = "no_match"

    return {
        "status": status,
        "score": score,
        "recurring_id": recurring_id,
        "name": name,
        "expected_amount": expected_amount,
        "expected_date": expected_date,
        "transaction_date": transaction_date,
        "amount": amount,
    }