from app.database.database import get_connection


def initialize_expense_allocation_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS expense_allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id INTEGER NOT NULL,
            person_id INTEGER,
            person_name TEXT NOT NULL,
            amount REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(expense_id)
                REFERENCES expenses(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()


def add_allocation(
    expense_id,
    person_name,
    amount,
    person_id=None,
):
    if amount <= 0:
        raise ValueError(
            "Allocation amount must be greater than 0."
        )

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO expense_allocations (
            expense_id,
            person_id,
            person_name,
            amount
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            expense_id,
            person_id,
            person_name,
            amount,
        ),
    )

    allocation_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return allocation_id


def get_allocations_for_expense(expense_id):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            expense_id,
            person_id,
            person_name,
            amount,
            created_at
        FROM expense_allocations
        WHERE expense_id = ?
        ORDER BY id
        """,
        (expense_id,),
    ).fetchall()

    connection.close()

    return rows


def get_total_allocated(expense_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT COALESCE(SUM(amount), 0)
        FROM expense_allocations
        WHERE expense_id = ?
        """,
        (expense_id,),
    ).fetchone()

    connection.close()

    return row[0]


def delete_allocation(allocation_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM expense_allocations
        WHERE id = ?
        """,
        (allocation_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted