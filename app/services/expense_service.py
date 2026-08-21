from datetime import date

from app.database.expense_database import (
    add_expense,
    get_expenses,
    get_expenses_by_date,
    delete_expense,
)

from app.services.expense_categories import (
    is_valid_category,
    is_valid_subcategory,
)


VALID_SOURCES = {
    "manual",
    "sms",
    "upi",
    "bank",
    "notification",
    "import",
}


VALID_PAYMENT_METHODS = {
    "cash",
    "upi",
    "debit_card",
    "credit_card",
    "bank_transfer",
    "other",
}


def record_expense(
    amount,
    category,
    subcategory=None,
    description=None,
    payment_method="cash",
    source="manual",
    merchant=None,
    transaction_reference=None,
    notes=None,
    expense_date=None,
):
    if amount <= 0:
        raise ValueError(
            "Expense amount must be greater than 0."
        )

    if not is_valid_category(category):
        raise ValueError(
            f"Invalid expense category: {category}"
        )

    if subcategory is not None:
        if not is_valid_subcategory(
            category,
            subcategory,
        ):
            raise ValueError(
                f"Invalid subcategory '{subcategory}' "
                f"for category '{category}'."
            )

    if source not in VALID_SOURCES:
        raise ValueError(
            f"Invalid expense source: {source}. "
            f"Allowed sources: {sorted(VALID_SOURCES)}"
        )

    if payment_method not in VALID_PAYMENT_METHODS:
        raise ValueError(
            f"Invalid payment method: {payment_method}. "
            f"Allowed methods: {sorted(VALID_PAYMENT_METHODS)}"
        )

    if expense_date is None:
        expense_date = date.today().isoformat()

    add_expense(
        expense_date=expense_date,
        category=category,
        subcategory=subcategory,
        amount=amount,
        description=description,
        payment_method=payment_method,
        source=source,
        merchant=merchant,
        transaction_reference=transaction_reference,
        notes=notes,
    )


def get_all_expenses():
    return get_expenses()


def get_today_expenses():
    return get_expenses_by_date(
        date.today().isoformat()
    )


def get_expenses_for_date(expense_date):
    return get_expenses_by_date(
        expense_date.isoformat()
    )


def remove_expense(expense_id):
    return delete_expense(expense_id)