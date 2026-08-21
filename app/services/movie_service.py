from app.services.activity_service import record_activity


def record_movie(
    movie_name,
    theatre=None,
    location=None,
    people_count=0,
    movie_date=None,
    notes=None,
):
    if not movie_name:
        raise ValueError("Movie name is required.")

    return record_activity(
        activity_type="movie",
        name=movie_name,
        venue=theatre,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=movie_date,
    )