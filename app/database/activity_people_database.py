from app.database.database import get_connection


def initialize_activity_people_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS activity_people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            person_id INTEGER NOT NULL,
            UNIQUE(activity_id, person_id),
            FOREIGN KEY(activity_id)
                REFERENCES activities(id)
                ON DELETE CASCADE,
            FOREIGN KEY(person_id)
                REFERENCES people(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()


def add_person_to_activity(
    activity_id,
    person_id,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT OR IGNORE INTO activity_people (
            activity_id,
            person_id
        )
        VALUES (?, ?)
        """,
        (
            activity_id,
            person_id,
        ),
    )

    connection.commit()
    connection.close()


def get_people_for_activity(activity_id):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            p.id,
            p.contact_id,
            p.display_name,
            p.emoji,
            p.photo_uri
        FROM activity_people ap
        JOIN people p
            ON p.id = ap.person_id
        WHERE ap.activity_id = ?
        ORDER BY p.display_name
        """,
        (activity_id,),
    ).fetchall()

    connection.close()

    return rows


def remove_person_from_activity(
    activity_id,
    person_id,
):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM activity_people
        WHERE activity_id = ?
        AND person_id = ?
        """,
        (
            activity_id,
            person_id,
        ),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted