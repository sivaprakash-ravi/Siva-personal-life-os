import sqlite3

from app.database.database import get_connection


def initialize_day_type_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS day_type_overrides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            override_date TEXT NOT NULL UNIQUE,
            day_type TEXT NOT NULL,
            notes TEXT
        )
        """
    )

    connection.commit()
    connection.close()


def set_day_type_override(override_date, day_type, notes=None):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO day_type_overrides (
            override_date,
            day_type,
            notes
        )
        VALUES (?, ?, ?)
        ON CONFLICT(override_date)
        DO UPDATE SET
            day_type = excluded.day_type,
            notes = excluded.notes
        """,
        (
            override_date,
            day_type,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_day_type_override(override_date):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            id,
            override_date,
            day_type,
            notes
        FROM day_type_overrides
        WHERE override_date = ?
        """,
        (override_date,),
    ).fetchone()

    connection.close()

    return row


def delete_day_type_override(override_date):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM day_type_overrides
        WHERE override_date = ?
        """,
        (override_date,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted