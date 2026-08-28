from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.meal_service import (
    record_meal,
    get_all_meals,
    edit_meal,
    remove_meal,
)
from app.services.nutrition_summary import (
    get_daily_nutrition_summary,
)


router = APIRouter(
    prefix="/api/v1/nutrition",
    tags=["Nutrition"],
)


class MealRequest(BaseModel):
    meal_type: str
    meal_time: str
    description: str
    calories: int | None = None
    protein_grams: float | None = None
    notes: str | None = None
    meal_date: str | None = None


@router.get("")
def nutrition_summary():
    return get_daily_nutrition_summary()


@router.get("/meals")
def meals():
    rows = get_all_meals()

    return [
        {
            "id": row[0],
            "date": row[1],
            "meal_type": row[2],
            "meal_time": row[3],
            "description": row[4],
            "calories": row[5],
            "protein_grams": row[6],
            "notes": row[7],
        }
        for row in rows
    ]


@router.get("/meals/today")
def today_meals():
    today = date.today().isoformat()

    rows = [
        row
        for row in get_all_meals()
        if row[1] == today
    ]

    return [
        {
            "id": row[0],
            "date": row[1],
            "meal_type": row[2],
            "meal_time": row[3],
            "description": row[4],
            "calories": row[5],
            "protein_grams": row[6],
            "notes": row[7],
        }
        for row in rows
    ]


@router.post("/meals")
def create_meal(request: MealRequest):
    meal_date = request.meal_date or date.today().isoformat()

    record_meal(
        meal_date=meal_date,
        meal_type=request.meal_type,
        meal_time=request.meal_time,
        description=request.description,
        calories=request.calories,
        protein_grams=request.protein_grams,
        notes=request.notes,
    )

    return {
        "status": "recorded",
        "meal_type": request.meal_type,
        "description": request.description,
        "calories": request.calories,
        "protein_grams": request.protein_grams,
        "date": meal_date,
    }


@router.put("/meals/{meal_id}")
def update_meal(
    meal_id: int,
    request: MealRequest,
):
    updated = edit_meal(
        meal_id=meal_id,
        meal_type=request.meal_type,
        meal_time=request.meal_time,
        description=request.description,
        calories=request.calories,
        protein_grams=request.protein_grams,
        notes=request.notes,
    )

    if updated == 0:
        raise HTTPException(
            status_code=404,
            detail="Meal not found.",
        )

    return {
        "meal_id": meal_id,
        "updated": updated,
    }


@router.delete("/meals/{meal_id}")
def delete_meal(meal_id: int):
    deleted = remove_meal(meal_id)

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Meal not found.",
        )

    return {
        "meal_id": meal_id,
        "deleted": deleted,
    }