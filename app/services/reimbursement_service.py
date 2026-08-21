from datetime import date

from app.database.reimbursement_database import (
    add_reimbursement,
    get_reimbursements_for_expense,
    get_total_reimbursed,
    delete_reimbursement,
)


def record_reimbursement(
    expense_id,
    person_name,
    amount,
    person_id=None,
    reimbursement_date=None,
    payment_method=None,
    notes=None,
):
    if not person_name:
        raise ValueError("Person name is required.")

    if amount <= 0:
        raise ValueError(
            "Reimbursement amount must be greater than 0."
        )

    if reimbursement_date is None:
        reimbursement_date = date.today().isoformat()

    return add_reimbursement(
        expense_id=expense_id,
        person_name=person_name,
        amount=amount,
        person_id=person_id,
        reimbursement_date=reimbursement_date,
        payment_method=payment_method,
        notes=notes,
    )


def get_expense_reimbursements(expense_id):
    return get_reimbursements_for_expense(
        expense_id
    )


def get_reimbursed_amount(expense_id):
    return get_total_reimbursed(
        expense_id
    )


def calculate_net_expense(
    expense_amount,
    expense_id,
):
    reimbursed = get_total_reimbursed(
        expense_id
    )

    net_expense = expense_amount - reimbursed

    return max(net_expense, 0)


def remove_reimbursement(reimbursement_id):
    return delete_reimbursement(
        reimbursement_id
    )