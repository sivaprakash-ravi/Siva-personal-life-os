from datetime import date

from app.database.recurring_database import (
    add_recurring_payment,
    get_recurring_payments,
    get_recurring_payment,
    update_recurring_payment,
    delete_recurring_payment,
)

from app.services.recurring_expenses import (
    calculate_next_expected_date,
    get_recurrence_status,
)


def create_recurring_payment(
    name,
    category,
    expected_amount=None,
    frequency="monthly",
    last_confirmed_date=None,
    notes=None,
):
    next_expected_date = None

    if last_confirmed_date:
        next_expected_date = calculate_next_expected_date(
            last_confirmed_date,
            frequency,
        )

    return add_recurring_payment(
        name=name,
        category=category,
        expected_amount=expected_amount,
        frequency=frequency,
        last_confirmed_date=last_confirmed_date,
        next_expected_date=next_expected_date,
        notes=notes,
    )


def get_all_recurring_payments():
    return get_recurring_payments()


def get_recurring_status(recurring_id):
    record = get_recurring_payment(recurring_id)

    if not record:
        raise ValueError(
            f"Recurring payment not found: {recurring_id}"
        )

    next_expected_date = record[6]

    if not next_expected_date:
        return {
            "id": record[0],
            "name": record[1],
            "status": "awaiting_first_payment",
        }

    status = get_recurrence_status(
        expected_date=next_expected_date,
        payment_detected=False,
    )

    return {
        "id": record[0],
        "name": record[1],
        "expected_amount": record[3],
        "frequency": record[4],
        "last_confirmed_date": record[5],
        "next_expected_date": next_expected_date,
        "status": status,
    }


def confirm_recurring_payment(
    recurring_id,
    payment_date=None,
    amount=None,
):
    if payment_date is None:
        payment_date = date.today().isoformat()

    record = get_recurring_payment(recurring_id)

    if not record:
        raise ValueError(
            f"Recurring payment not found: {recurring_id}"
        )

    frequency = record[4]

    next_expected_date = calculate_next_expected_date(
        payment_date,
        frequency,
    )

    return update_recurring_payment(
        recurring_id=recurring_id,
        last_confirmed_date=payment_date,
        next_expected_date=next_expected_date,
        expected_amount=amount,
    )


def remove_recurring_payment(recurring_id):
    return delete_recurring_payment(recurring_id)