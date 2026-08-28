from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.expense_service import (
    record_expense,
    get_all_expenses,
    get_today_expenses,
    get_expenses_for_date,
    edit_expense,
    remove_expense,
)

from app.services.expense_intelligence import (
    get_daily_expense_summary,
    get_monthly_expense_summary,
)

from app.services.spending_insights import (
    get_monthly_total,
    get_spending_insights,
)

from app.services.transaction_importer import (
    import_transaction,
)

from app.services.sms_transaction_parser import (
    import_sms_transaction,
)


router = APIRouter(
    prefix="/api/v1/finance",
    tags=["Finance"],
)


class ExpenseRequest(BaseModel):
    amount: float
    category: str
    subcategory: str | None = None
    description: str | None = None
    payment_method: str = "cash"
    source: str = "manual"
    merchant: str | None = None
    transaction_reference: str | None = None
    notes: str | None = None
    expense_date: str | None = None


class TransactionImportRequest(BaseModel):
    amount: float
    transaction_date: str | None = None
    merchant: str | None = None
    description: str | None = None
    payment_method: str | None = None
    source: str = "manual"
    transaction_reference: str | None = None
    category: str = "other"
    subcategory: str | None = None
    notes: str | None = None


class SmsTransactionRequest(BaseModel):
    message: str
    transaction_date: str | None = None
    category: str = "other"
    subcategory: str | None = None
    notes: str | None = None


def serialize_expense(expense):
    return {
        "id": expense[0],
        "date": expense[1],
        "category": expense[2],
        "subcategory": expense[3],
        "amount": expense[4],
        "description": expense[5],
        "payment_method": expense[6],
        "source": expense[7],
        "merchant": expense[8],
        "transaction_reference": expense[9],
        "notes": expense[10],
    }


@router.get("/daily")
def daily_finance():
    return get_daily_expense_summary()


@router.get("/monthly")
def monthly_finance():
    return get_monthly_expense_summary()


@router.get("/total")
def monthly_total():
    return {
        "monthly_total": get_monthly_total(),
    }


@router.get("/insights")
def spending_insights():
    return get_spending_insights()


@router.get("/expenses")
def expenses():
    return [
        serialize_expense(expense)
        for expense in get_all_expenses()
    ]


@router.get("/expenses/today")
def today_expenses():
    return [
        serialize_expense(expense)
        for expense in get_today_expenses()
    ]


@router.get("/expenses/{expense_date}")
def expenses_for_date(expense_date: str):
    try:
        target_date = date.fromisoformat(expense_date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date. Use YYYY-MM-DD.",
        )

    return [
        serialize_expense(expense)
        for expense in get_expenses_for_date(target_date)
    ]


@router.post("/expenses")
def create_expense(request: ExpenseRequest):
    try:
        expense_id = record_expense(
            amount=request.amount,
            category=request.category,
            subcategory=request.subcategory,
            description=request.description,
            payment_method=request.payment_method,
            source=request.source,
            merchant=request.merchant,
            transaction_reference=request.transaction_reference,
            notes=request.notes,
            expense_date=request.expense_date,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "status": "recorded",
        "expense_id": expense_id,
    }


@router.post("/import")
def import_financial_transaction(
    request: TransactionImportRequest,
):
    try:
        result = import_transaction(
            amount=request.amount,
            transaction_date=request.transaction_date,
            merchant=request.merchant,
            description=request.description,
            payment_method=request.payment_method,
            source=request.source,
            transaction_reference=request.transaction_reference,
            category=request.category,
            subcategory=request.subcategory,
            notes=request.notes,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return result


@router.post("/import/sms")
def import_sms(
    request: SmsTransactionRequest,
):
    try:
        result = import_sms_transaction(
            message=request.message,
            transaction_date=request.transaction_date,
            category=request.category,
            subcategory=request.subcategory,
            notes=request.notes,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return result


@router.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    request: ExpenseRequest,
):
    try:
        updated = edit_expense(
            expense_id=expense_id,
            category=request.category,
            subcategory=request.subcategory,
            amount=request.amount,
            description=request.description,
            payment_method=request.payment_method,
            source=request.source,
            merchant=request.merchant,
            transaction_reference=request.transaction_reference,
            notes=request.notes,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if updated == 0:
        raise HTTPException(
            status_code=404,
            detail="Expense not found.",
        )

    return {
        "expense_id": expense_id,
        "updated": updated,
    }


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    deleted = remove_expense(expense_id)

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Expense not found.",
        )

    return {
        "expense_id": expense_id,
        "deleted": deleted,
    }