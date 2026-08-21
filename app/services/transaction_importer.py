from app.services.transaction_normalizer import (
    normalize_transaction,
)

from app.services.expense_service import (
    record_expense,
)

from app.database.expense_database import (
    find_expense_by_transaction_reference,
    find_possible_duplicate_expense,
)


def import_transaction(
    amount,
    transaction_date=None,
    merchant=None,
    description=None,
    payment_method=None,
    source="manual",
    transaction_reference=None,
    category="other",
    subcategory=None,
    notes=None,
):
    """
    Import an external transaction into the expense system.

    Flow:
        Raw transaction
            ↓
        Normalize
            ↓
        Exact duplicate check
            ↓
        Possible duplicate check
            ↓
        Create expense
    """

    transaction = normalize_transaction(
        amount=amount,
        transaction_date=transaction_date,
        merchant=merchant,
        description=description,
        payment_method=payment_method,
        source=source,
        transaction_reference=transaction_reference,
    )

    # ---------------------------------------------------------
    # 1. Exact duplicate check
    # ---------------------------------------------------------
    if transaction["transaction_reference"]:
        existing = find_expense_by_transaction_reference(
            transaction["transaction_reference"]
        )

        if existing:
            return {
                "expense_id": existing[0],
                "status": "duplicate",
                "transaction": transaction,
            }

    # ---------------------------------------------------------
    # 2. Possible duplicate check
    # ---------------------------------------------------------
    possible_duplicate = (
        find_possible_duplicate_expense(
            expense_date=transaction["transaction_date"],
            amount=transaction["amount"],
            merchant=transaction["merchant"],
            description=transaction["description"],
            source=transaction["source"],
        )
    )

    if possible_duplicate:
        return {
            "expense_id": possible_duplicate[0],
            "status": "possible_duplicate",
            "transaction": transaction,
        }

    # ---------------------------------------------------------
    # 3. Create expense
    # ---------------------------------------------------------
    expense_id = record_expense(
        amount=transaction["amount"],
        category=category,
        subcategory=subcategory,
        description=transaction["description"],
        payment_method=(
            transaction["payment_method"]
            or "other"
        ),
        source=transaction["source"],
        merchant=transaction["merchant"],
        transaction_reference=(
            transaction["transaction_reference"]
        ),
        notes=notes,
        expense_date=transaction["transaction_date"],
    )

    return {
        "expense_id": expense_id,
        "status": "imported",
        "transaction": transaction,
    }