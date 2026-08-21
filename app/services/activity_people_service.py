from app.database.activity_people_database import (
    add_person_to_activity,
    get_people_for_activity,
    remove_person_from_activity,
)
from app.services.people_service import get_person_by_id


def add_people_to_activity(activity_id, person_ids):
    if not person_ids:
        return

    for person_id in person_ids:
        person = get_person_by_id(person_id)

        if not person:
            raise ValueError(
                f"Person not found: {person_id}"
            )

        add_person_to_activity(
            activity_id=activity_id,
            person_id=person_id,
        )


def get_activity_people(activity_id):
    return get_people_for_activity(activity_id)


def remove_person(activity_id, person_id):
    return remove_person_from_activity(
        activity_id=activity_id,
        person_id=person_id,
    )


def replace_activity_people(activity_id, person_ids):
    current_people = get_people_for_activity(
        activity_id
    )

    current_ids = {
        person[0]
        for person in current_people
    }

    new_ids = set(person_ids)

    for person_id in current_ids - new_ids:
        remove_person_from_activity(
            activity_id,
            person_id,
        )

    for person_id in new_ids - current_ids:
        person = get_person_by_id(person_id)

        if not person:
            raise ValueError(
                f"Person not found: {person_id}"
            )

        add_person_to_activity(
            activity_id,
            person_id,
        )