from fastapi import APIRouter

from app.services.daily_summary import get_daily_summary


router = APIRouter(
    prefix="/api/v1/daily",
    tags=["Daily"],
)


@router.get("")
def daily_summary():
    return get_daily_summary()