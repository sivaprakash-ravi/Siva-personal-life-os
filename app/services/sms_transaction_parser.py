import re

from app.services.transaction_importer import import_transaction


AMOUNT_PATTERNS = [
    r"(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)",
    r"(?:debited|spent|paid|sent)\s+(?:by|for)?\s*(?:INR|Rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)",
]

REFERENCE_PATTERNS = [
    r"(?:UPI Ref(?:erence)?|Txn(?:action)? ID|Ref(?:erence)? No\.?)[:\s-]*([A-Za-z0-9]+)",
]

MERCHANT_PATTERNS = [
    r"(?:to|at|towards)\s+([A-Za-z0-9 &._'-]+?)(?:\s+on|\s+via|\s+using|\.|$)",
]


def parse_sms_transaction(
    message,
    transaction_date=None,
):
    """
    Parse a bank/UPI transaction SMS into normalized
    transaction fields.

    This function does not write to the database.
    """

    if not message or not message.strip():
        raise ValueError("SMS message cannot be empty.")

    amount = None

    for pattern in AMOUNT_PATTERNS:
        match = re.search(
            pattern,
            message,
            flags=re.IGNORECASE,
        )

        if match:
            amount = float(
                match.group(1).replace(",", "")
            )
            break

    if amount is None:
        raise ValueError(
            "Could not identify transaction amount."
        )

    transaction_reference = None

    for pattern in REFERENCE_PATTERNS:
        match = re.search(
            pattern,
            message,
            flags=re.IGNORECASE,
        )

        if match:
            transaction_reference = match.group(1)
            break

    merchant = None

    for pattern in MERCHANT_PATTERNS:
        match = re.search(
            pattern,
            message,
            flags=re.IGNORECASE,
        )

        if match:
            merchant = match.group(1).strip()
            break

    lowered = message.lower()

    if "upi" in lowered:
        payment_method = "upi"
    elif "credit card" in lowered:
        payment_method = "credit_card"
    elif "debit card" in lowered:
        payment_method = "debit_card"
    else:
        payment_method = "bank"

    return {
        "amount": amount,
        "transaction_date": transaction_date,
        "merchant": merchant,
        "description": message.strip(),
        "payment_method": payment_method,
        "source": "sms",
        "transaction_reference": transaction_reference,
    }


def import_sms_transaction(
    message,
    transaction_date=None,
    category="other",
    subcategory=None,
    notes=None,
):
    """
    Parse an SMS and send it through the existing
    transaction importer.

    Duplicate protection remains inside
    transaction_importer.
    """

    transaction = parse_sms_transaction(
        message=message,
        transaction_date=transaction_date,
    )

    return import_transaction(
        amount=transaction["amount"],
        transaction_date=transaction[
            "transaction_date"
        ],
        merchant=transaction["merchant"],
        description=transaction["description"],
        payment_method=transaction[
            "payment_method"
        ],
        source="sms",
        transaction_reference=transaction[
            "transaction_reference"
        ],
        category=category,
        subcategory=subcategory,
        notes=notes,
    )