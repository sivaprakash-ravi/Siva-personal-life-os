from app.database.database import get_connection


def initialize_activity_expense_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS activity_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            expense_id INTEGER NOT NULL,
            amount_paid REAL NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(activity_id, expense_id),
            FOREIGN KEY(activity_id)
                REFERENCES activities(id)
                ON DELETE CASCADE,
            FOREIGN KEY(expense_id)
                REFERENCES expenses(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()


def link_expense_to_activity(
    activity_id,
    expense_id,
    amount_paid,
    notes=None,
):
    if amount_paid <= 0:
        raise ValueError(
            "Amount paid must be greater than 0."
        )

    connection = get_connection()

    connection.execute(
        """
        INSERT OR REPLACE INTO activity_expenses (
            activity_id,
            expense_id,
            amount_paid,
            notes
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            activity_id,
            expense_id,
            amount_paid,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_expenses_for_activity(activity_id):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            ae.id,
            ae.activity_id,
            ae.expense_id,
            ae.amount_paid,
            ae.notes,
            e.expense_date,
            e.category,
            e.subcategory,
            e.description,
            e.payment_method,
            e.source,
            e.merchant
        FROM activity_expenses ae
        JOIN expenses e
            ON e.id = ae.expense_id
        WHERE ae.activity_id = ?
        ORDER BY ae.id
        """,
        (activity_id,),
    ).fetchall()

    connection.close()

    return rows


def unlink_expense_from_activity(
    activity_id,
    expense_id,
):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM activity_expenses
        WHERE activity_id = ?
        AND expense_id = ?
        """,
        (
            activity_id,
            expense_id,
        ),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted