from app.database.database import get_connection


def initialize_recurring_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS recurring_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            expected_amount REAL,
            frequency TEXT NOT NULL,
            last_confirmed_date TEXT,
            next_expected_date TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


def add_recurring_payment(
    name,
    category,
    expected_amount=None,
    frequency="monthly",
    last_confirmed_date=None,
    next_expected_date=None,
    notes=None,
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO recurring_payments (
            name,
            category,
            expected_amount,
            frequency,
            last_confirmed_date,
            next_expected_date,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            name,
            category,
            expected_amount,
            frequency,
            last_confirmed_date,
            next_expected_date,
            notes,
        ),
    )

    recurring_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return recurring_id


def get_recurring_payments():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            name,
            category,
            expected_amount,
            frequency,
            last_confirmed_date,
            next_expected_date,
            active,
            notes,
            created_at
        FROM recurring_payments
        WHERE active = 1
        ORDER BY next_expected_date
        """
    ).fetchall()

    connection.close()

    return rows


def get_recurring_payment(recurring_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            id,
            name,
            category,
            expected_amount,
            frequency,
            last_confirmed_date,
            next_expected_date,
            active,
            notes,
            created_at
        FROM recurring_payments
        WHERE id = ?
        """,
        (recurring_id,),
    ).fetchone()

    connection.close()

    return row


def update_recurring_payment(
    recurring_id,
    last_confirmed_date=None,
    next_expected_date=None,
    expected_amount=None,
    active=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        UPDATE recurring_payments
        SET
            last_confirmed_date =
                COALESCE(?, last_confirmed_date),
            next_expected_date =
                COALESCE(?, next_expected_date),
            expected_amount =
                COALESCE(?, expected_amount),
            active =
                COALESCE(?, active),
            notes =
                COALESCE(?, notes)
        WHERE id = ?
        """,
        (
            last_confirmed_date,
            next_expected_date,
            expected_amount,
            active,
            notes,
            recurring_id,
        ),
    )

    connection.commit()

    rows_updated = connection.total_changes

    connection.close()

    return rows_updated


def delete_recurring_payment(recurring_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM recurring_payments
        WHERE id = ?
        """,
        (recurring_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted