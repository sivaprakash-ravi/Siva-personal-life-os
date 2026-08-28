from fastapi import APIRouter

from app.services.unified_life_record import get_unified_life_record


router = APIRouter(
    prefix="/api/v1/unified",
    tags=["Unified"],
)


@router.get("")
def unified_life_record():
    return get_unified_life_record()