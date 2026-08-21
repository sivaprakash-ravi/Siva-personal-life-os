from app.database.people_database import (
    add_person,
    get_people,
    get_person,
    delete_person,
)


def sync_contact(
    contact_id,
    display_name,
    emoji=None,
    photo_uri=None,
):
    if not contact_id:
        raise ValueError("Contact ID is required.")

    if not display_name:
        raise ValueError("Contact display name is required.")

    add_person(
        display_name=display_name,
        contact_id=contact_id,
        emoji=emoji,
        photo_uri=photo_uri,
        source="contact",
    )


def add_manual_person(display_name):
    if not display_name:
        raise ValueError("Person name is required.")

    add_person(
        display_name=display_name,
        source="manual",
    )


def get_all_people():
    return get_people()


def get_person_by_id(person_id):
    return get_person(person_id)


def remove_person(person_id):
    return delete_person(person_id)