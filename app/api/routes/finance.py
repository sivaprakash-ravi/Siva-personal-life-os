from fastapi import APIRouter

from app.services.expense_intelligence import (
    get_daily_expense_summary,
    get_monthly_expense_summary,
)
from app.services.spending_insights import (
    get_monthly_total,
    get_spending_insights,
)


router = APIRouter(
    prefix="/api/v1/finance",
    tags=["Finance"],
)


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