from datetime import date

from app.services.recurring_service import (
    get_all_recurring_payments,
)
from app.services.recurring_expenses import (
    get_recurrence_status,
)


def get_recurring_dashboard():
    today = date.today()
    records = get_all_recurring_payments()

    dashboard = []

    for record in records:
        (
            recurring_id,
            name,
            category,
            expected_amount,
            frequency,
            last_confirmed_date,
            next_expected_date,
            active,
            notes,
            created_at,
        ) = record

        if not next_expected_date:
            status = "awaiting_first_payment"
        else:
            status = get_recurrence_status(
                expected_date=next_expected_date,
                payment_detected=False,
                today=today,
            )

        dashboard.append(
            {
                "id": recurring_id,
                "name": name,
                "category": category,
                "expected_amount": expected_amount,
                "frequency": frequency,
                "last_confirmed_date": last_confirmed_date,
                "next_expected_date": next_expected_date,
                "status": status,
                "active": bool(active),
            }
        )

    return dashboard