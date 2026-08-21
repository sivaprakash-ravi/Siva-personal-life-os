from app.database.database import get_connection


def initialize_activity_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_date TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            name TEXT,
            venue TEXT,
            location TEXT,
            people_count INTEGER DEFAULT 0,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


def add_activity(
    activity_date,
    activity_type,
    name=None,
    venue=None,
    location=None,
    people_count=0,
    notes=None,
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO activities (
            activity_date,
            activity_type,
            name,
            venue,
            location,
            people_count,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            activity_date,
            activity_type,
            name,
            venue,
            location,
            people_count,
            notes,
        ),
    )

    activity_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return activity_id


def get_activities():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            activity_date,
            activity_type,
            name,
            venue,
            location,
            people_count,
            notes,
            created_at
        FROM activities
        ORDER BY activity_date DESC, id DESC
        """
    ).fetchall()

    connection.close()

    return rows


def get_activities_by_date(activity_date):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            activity_date,
            activity_type,
            name,
            venue,
            location,
            people_count,
            notes,
            created_at
        FROM activities
        WHERE activity_date = ?
        ORDER BY id DESC
        """,
        (activity_date,),
    ).fetchall()

    connection.close()

    return rows


def delete_activity(activity_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM activities
        WHERE id = ?
        """,
        (activity_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted