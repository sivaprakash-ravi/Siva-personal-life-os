from fastapi import APIRouter, HTTPException

from app.services.checkin_service import (
    create_today_checkins,
    get_today_checkins,
    complete_checkin,
    edit_checkin,
)
from app.services.daily_summary import get_daily_summary
from app.services.overall_progress import get_daily_overview
from app.services.weekly_summary import get_weekly_summary


router = APIRouter(
    prefix="/api/v1",
    tags=["daily"],
)


@router.get("/daily")
def daily_summary():
    create_today_checkins()
    return get_daily_summary()


@router.get("/daily/weekly")
def weekly_daily_summary():
    create_today_checkins()
    return get_weekly_summary()


@router.get("/daily/overview")
def daily_overview(date: str | None = None):
    """
    Canonical overall daily progress across the measurable daily domains
    (daily check-ins, health, nutrition). Finance is excluded by design and
    activity has no measurable target. Missing domains are reported as
    unavailable instead of being fabricated or scored as zero.
    """
    # Mirrors the other /daily endpoints: guarantee today's check-ins exist so
    # a first request of the day still reports the daily domain accurately.
    create_today_checkins()
    try:
        return get_daily_overview(date)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@router.get("/daily/checkins")
def daily_checkins():
    create_today_checkins()

    checkins = get_today_checkins()

    return [
        {
            "id": checkin[0],
            "date": checkin[1],
            "type": checkin[2],
            "scheduled_time": checkin[3],
            "completed_at": checkin[4],
            "status": checkin[5],
            "notes": checkin[6],
        }
        for checkin in checkins
    ]


@router.post("/daily/checkins/{checkin_id}/complete")
def complete_daily_checkin(checkin_id: int):
    updated = complete_checkin(checkin_id)

    return {
        "checkin_id": checkin_id,
        "updated": updated,
        "status": "completed",
    }


@router.post("/daily/checkins/{checkin_id}/undo")
def undo_daily_checkin(checkin_id: int):
    updated = edit_checkin(
        checkin_id=checkin_id,
        status="pending",
        completed_at=None,
    )

    return {
        "checkin_id": checkin_id,
        "updated": updated,
        "status": "pending",
    }