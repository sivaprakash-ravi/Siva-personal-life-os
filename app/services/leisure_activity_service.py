from app.services.activity_service import record_activity


def record_eating_out(
    place=None,
    location=None,
    people_count=0,
    activity_date=None,
    notes=None,
):
    return record_activity(
        activity_type="eating_out",
        name=place,
        venue=place,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=activity_date,
    )


def record_outing(
    outing_name=None,
    location=None,
    people_count=0,
    activity_date=None,
    notes=None,
):
    return record_activity(
        activity_type="outing",
        name=outing_name,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=activity_date,
    )


def record_trip(
    trip_name=None,
    location=None,
    people_count=0,
    activity_date=None,
    notes=None,
):
    return record_activity(
        activity_type="trip",
        name=trip_name,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=activity_date,
    )