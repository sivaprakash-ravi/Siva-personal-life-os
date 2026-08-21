from app.services.activity_service import record_activity
from app.services.activity_people_service import add_people_to_activity


def create_activity(
    activity_type,
    name=None,
    venue=None,
    location=None,
    people_ids=None,
    people_count=None,
    activity_date=None,
    notes=None,
):
    people_ids = people_ids or []

    if people_count is None:
        people_count = len(people_ids)

    activity_id = record_activity(
        activity_type=activity_type,
        name=name,
        venue=venue,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=activity_date,
    )

    if people_ids:
        add_people_to_activity(
            activity_id,
            people_ids,
        )

    return activity_id