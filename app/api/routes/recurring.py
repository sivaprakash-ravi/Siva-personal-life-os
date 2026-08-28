from fastapi import APIRouter

from app.services.recurring_dashboard import get_recurring_dashboard


router = APIRouter(
    prefix="/api/v1/recurring",
    tags=["Recurring"],
)


@router.get("")
def recurring_dashboard():
    return get_recurring_dashboard()