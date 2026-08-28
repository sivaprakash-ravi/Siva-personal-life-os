from fastapi import APIRouter

from app.services.nutrition_summary import get_daily_nutrition_summary


router = APIRouter(
    prefix="/api/v1/nutrition",
    tags=["Nutrition"],
)


@router.get("")
def nutrition_summary():
    return get_daily_nutrition_summary()