from datetime import date


VALID_SOURCES = {
    "google_play",
    "sms",
    "upi",
    "bank",
    "credit_card",
    "debit_card",
    "manual",
}


def normalize_transaction(
    amount,
    transaction_date=None,
    merchant=None,
    description=None,
    payment_method=None,
    source="manual",
    transaction_reference=None,
):
    if amount <= 0:
        raise ValueError(
            "Transaction amount must be greater than 0."
        )

    if source not in VALID_SOURCES:
        raise ValueError(
            f"Invalid transaction source: {source}"
        )

    if transaction_date is None:
        transaction_date = date.today().isoformat()

    return {
        "amount": float(amount),
        "transaction_date": transaction_date,
        "merchant": merchant,
        "description": description,
        "payment_method": payment_method,
        "source": source,
        "transaction_reference": transaction_reference,
    }