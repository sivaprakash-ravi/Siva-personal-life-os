from app.database.database import get_connection


def initialize_confirmation_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS recurring_confirmations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recurring_id INTEGER NOT NULL,
            expense_id INTEGER NOT NULL,
            confidence_score REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            resolved_at TEXT,
            FOREIGN KEY (recurring_id)
                REFERENCES recurring_payments(id),
            FOREIGN KEY (expense_id)
                REFERENCES expenses(id)
        )
        """
    )

    connection.commit()
    connection.close()


def add_pending_confirmation(
    recurring_id,
    expense_id,
    confidence_score,
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO recurring_confirmations (
            recurring_id,
            expense_id,
            confidence_score,
            status
        )
        VALUES (?, ?, ?, 'pending')
        """,
        (
            recurring_id,
            expense_id,
            confidence_score,
        ),
    )

    confirmation_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return confirmation_id


def get_pending_confirmations():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            rc.id,
            rc.recurring_id,
            rp.name,
            rc.expense_id,
            e.amount,
            e.expense_date,
            e.merchant,
            e.description,
            rc.confidence_score,
            rc.created_at
        FROM recurring_confirmations rc
        JOIN recurring_payments rp
            ON rp.id = rc.recurring_id
        JOIN expenses e
            ON e.id = rc.expense_id
        WHERE rc.status = 'pending'
        ORDER BY rc.created_at DESC
        """
    ).fetchall()

    connection.close()

    return rows


def resolve_confirmation(
    confirmation_id,
    status,
):
    if status not in {
        "confirmed",
        "rejected",
    }:
        raise ValueError(
            "Status must be 'confirmed' or 'rejected'."
        )

    connection = get_connection()

    connection.execute(
        """
        UPDATE recurring_confirmations
        SET
            status = ?,
            resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            status,
            confirmation_id,
        ),
    )

    connection.commit()

    rows_updated = connection.total_changes

    connection.close()

    return rows_updated