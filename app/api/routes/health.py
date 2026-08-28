from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.health_service import (
    record_health,
    get_all_health_records,
    get_today_health_records,
    get_health_for_date,
    remove_health_record,
)
from app.services.health_summary import get_daily_health_summary


router = APIRouter(
    prefix="/api/v1/health",
    tags=["Health"],
)


class HealthRecordRequest(BaseModel):
    metric_type: str
    value: float | None = None
    unit: str | None = None
    source: str = "manual"
    notes: str | None = None
    record_date: str | None = None


@router.get("")
def health_summary():
    return get_daily_health_summary()


@router.get("/records")
def health_records():
    records = get_all_health_records()

    return [
        {
            "id": record[0],
            "date": record[1],
            "metric_type": record[2],
            "value": record[3],
            "unit": record[4],
            "source": record[5],
            "notes": record[6],
        }
        for record in records
    ]


@router.get("/records/today")
def today_health_records():
    records = get_today_health_records()

    return [
        {
            "id": record[0],
            "date": record[1],
            "metric_type": record[2],
            "value": record[3],
            "unit": record[4],
            "source": record[5],
            "notes": record[6],
        }
        for record in records
    ]


@router.get("/records/{record_date}")
def health_records_for_date(record_date: str):
    try:
        target_date = date.fromisoformat(record_date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date. Use YYYY-MM-DD.",
        )

    records = get_health_for_date(target_date)

    return [
        {
            "id": record[0],
            "date": record[1],
            "metric_type": record[2],
            "value": record[3],
            "unit": record[4],
            "source": record[5],
            "notes": record[6],
        }
        for record in records
    ]


@router.post("/records")
def create_health_record(request: HealthRecordRequest):
    try:
        record_health(
            metric_type=request.metric_type,
            value=request.value,
            unit=request.unit,
            source=request.source,
            notes=request.notes,
            record_date=request.record_date,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "status": "recorded",
        "metric_type": request.metric_type,
        "value": request.value,
        "unit": request.unit,
        "source": request.source,
    }


@router.delete("/records/{record_id}")
def delete_health_record(record_id: int):
    deleted = remove_health_record(record_id)

    return {
        "record_id": record_id,
        "deleted": deleted,
    }