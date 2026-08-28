from app.services.recurring_confidence import (
    match_recurring_payment,
)

from app.services.recurring_matcher import (
    confirm_from_matching_expense,
)

from app.database.recurring_confirmation_database import (
    add_pending_confirmation,
)


def process_recurring_transaction(
    recurring_id,
    expense_id,
    transaction_date,
    amount,
    merchant=None,
    description=None,
):
    match = match_recurring_payment(
        recurring_id=recurring_id,
        transaction_date=transaction_date,
        amount=amount,
        merchant=merchant,
        description=description,
    )

    if match["status"] == "strong_match":
        confirmation = confirm_from_matching_expense(
            recurring_id=recurring_id,
            expense_id=expense_id,
        )

        return {
            "status": "renewed",
            "automatic": True,
            "confidence": match["score"],
            "confirmation": confirmation,
        }

    if match["status"] == "possible_match":
        confirmation_id = add_pending_confirmation(
            recurring_id=recurring_id,
            expense_id=expense_id,
            confidence_score=match["score"],
        )

        return {
            "status": "needs_review",
            "automatic": False,
            "confidence": match["score"],
            "confirmation_id": confirmation_id,
        }

    return {
        "status": "no_match",
        "automatic": False,
        "confidence": match["score"],
    }