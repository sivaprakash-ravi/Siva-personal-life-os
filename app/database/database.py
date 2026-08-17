import sqlite3
from pathlib import Path


DATABASE_DIR = Path("data")
DATABASE_DIR.mkdir(exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "personal_life.db"


def get_connection():
    return sqlite3.connect(DATABASE_PATH)


def initialize_database():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_checkins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checkin_date TEXT NOT NULL,
            checkin_type TEXT NOT NULL,
            scheduled_time TEXT NOT NULL,
            completed_at TEXT,
            status TEXT NOT NULL,
            notes TEXT
        )
        """
    )

    connection.commit()
    connection.close()


def add_checkin(
    checkin_date,
    checkin_type,
    scheduled_time,
    status,
    completed_at=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO daily_checkins (
            checkin_date,
            checkin_type,
            scheduled_time,
            completed_at,
            status,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            checkin_date,
            checkin_type,
            scheduled_time,
            completed_at,
            status,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_checkins():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            checkin_date,
            checkin_type,
            scheduled_time,
            completed_at,
            status,
            notes
        FROM daily_checkins
        ORDER BY checkin_date DESC, scheduled_time DESC
        """
    ).fetchall()

    connection.close()

    return rows


def update_checkin(
    checkin_id,
    status=None,
    completed_at=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        UPDATE daily_checkins
        SET
            status = COALESCE(?, status),
            completed_at = COALESCE(?, completed_at),
            notes = COALESCE(?, notes)
        WHERE id = ?
        """,
        (
            status,
            completed_at,
            notes,
            checkin_id,
        ),
    )

    connection.commit()

    rows_updated = connection.total_changes

    connection.close()

    return rows_updated


def delete_checkin(checkin_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM daily_checkins
        WHERE id = ?
        """,
        (checkin_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted