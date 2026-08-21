import sqlite3

from app.database.database import get_connection


def initialize_health_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_date TEXT NOT NULL,
            metric_type TEXT NOT NULL,
            value REAL,
            unit TEXT,
            source TEXT DEFAULT 'manual',
            notes TEXT
        )
        """
    )

    columns = {
        row[1]
        for row in connection.execute(
            "PRAGMA table_info(health_records)"
        ).fetchall()
    }

    if "source" not in columns:
        connection.execute(
            """
            ALTER TABLE health_records
            ADD COLUMN source TEXT DEFAULT 'manual'
            """
        )

    connection.commit()
    connection.close()


def add_health_record(
    record_date,
    metric_type,
    value=None,
    unit=None,
    source="manual",
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO health_records (
            record_date,
            metric_type,
            value,
            unit,
            source,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            record_date,
            metric_type,
            value,
            unit,
            source,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_health_records():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            record_date,
            metric_type,
            value,
            unit,
            source,
            notes
        FROM health_records
        ORDER BY record_date DESC, id DESC
        """
    ).fetchall()

    connection.close()

    return rows


def get_health_records_by_date(record_date):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            record_date,
            metric_type,
            value,
            unit,
            source,
            notes
        FROM health_records
        WHERE record_date = ?
        ORDER BY id DESC
        """,
        (record_date,),
    ).fetchall()

    connection.close()

    return rows


def delete_health_record(record_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM health_records
        WHERE id = ?
        """,
        (record_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted