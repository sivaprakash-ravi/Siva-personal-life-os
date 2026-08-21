from app.services.activity_service import (
    record_activity,
    GAME_TYPES,
)


def record_game(
    game_type,
    venue=None,
    location=None,
    people_count=0,
    game_date=None,
    notes=None,
    custom_name=None,
):
    if game_type not in GAME_TYPES:
        raise ValueError(
            f"Invalid game type: {game_type}. "
            f"Allowed types: {sorted(GAME_TYPES)}"
        )

    if game_type == "custom":
        if not custom_name:
            raise ValueError(
                "Custom game name is required."
            )

        game_name = custom_name
    else:
        game_name = game_type

    return record_activity(
        activity_type="game",
        name=game_name,
        venue=venue,
        location=location,
        people_count=people_count,
        notes=notes,
        activity_date=game_date,
    )