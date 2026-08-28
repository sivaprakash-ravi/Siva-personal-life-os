from fastapi import APIRouter

from app.services.health_summary import get_daily_health_summary


router = APIRouter(
    prefix="/api/v1/health",
    tags=["Health"],
)


@router.get("")
def health_summary():
    return get_daily_health_summary()