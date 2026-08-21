from datetime import date

from app.database.activity_database import (
    add_activity,
    get_activities,
    get_activities_by_date,
    delete_activity,
)


ACTIVITY_TYPES = {
    "movie": {
        "name": "Movie",
        "requires_name": True,
        "requires_venue": False,
    },
    "game": {
        "name": "Game",
        "requires_name": True,
        "requires_venue": False,
    },
    "eating_out": {
        "name": "Eating Out",
        "requires_name": False,
        "requires_venue": False,
    },
    "outing": {
        "name": "Outing",
        "requires_name": False,
        "requires_venue": False,
    },
    "trip": {
        "name": "Trip",
        "requires_name": False,
        "requires_venue": False,
    },
}


GAME_TYPES = {
    "badminton",
    "cricket",
    "billiards",
    "custom",
}


def get_activity_types():
    return list(ACTIVITY_TYPES.keys())


def get_game_types():
    return list(GAME_TYPES)


def record_activity(
    activity_type,
    name=None,
    venue=None,
    location=None,
    people_count=0,
    notes=None,
    activity_date=None,
):
    if activity_type not in ACTIVITY_TYPES:
        raise ValueError(
            f"Invalid activity type: {activity_type}"
        )

    if people_count < 0:
        raise ValueError(
            "People count cannot be negative."
        )

    config = ACTIVITY_TYPES[activity_type]

    if config["requires_name"] and not name:
        raise ValueError(
            f"{config['name']} name/type is required."
        )

    if activity_date is None:
        activity_date = date.today().isoformat()

    return add_activity(
        activity_date=activity_date,
        activity_type=activity_type,
        name=name,
        venue=venue,
        location=location,
        people_count=people_count,
        notes=notes,
    )


def get_all_activities():
    return get_activities()


def get_today_activities():
    return get_activities_by_date(
        date.today().isoformat()
    )


def get_activities_for_date(activity_date):
    return get_activities_by_date(
        activity_date.isoformat()
    )


def remove_activity(activity_id):
    return delete_activity(activity_id)