from app.database.database import get_connection


def initialize_reimbursement_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS reimbursements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id INTEGER NOT NULL,
            person_id INTEGER,
            person_name TEXT NOT NULL,
            amount REAL NOT NULL,
            reimbursement_date TEXT,
            payment_method TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(expense_id)
                REFERENCES expenses(id)
                ON DELETE CASCADE
        )
        """
    )

    connection.commit()
    connection.close()


def add_reimbursement(
    expense_id,
    person_name,
    amount,
    person_id=None,
    reimbursement_date=None,
    payment_method=None,
    notes=None,
):
    if amount <= 0:
        raise ValueError(
            "Reimbursement amount must be greater than 0."
        )

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO reimbursements (
            expense_id,
            person_id,
            person_name,
            amount,
            reimbursement_date,
            payment_method,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            expense_id,
            person_id,
            person_name,
            amount,
            reimbursement_date,
            payment_method,
            notes,
        ),
    )

    reimbursement_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return reimbursement_id


def get_reimbursements_for_expense(expense_id):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            expense_id,
            person_id,
            person_name,
            amount,
            reimbursement_date,
            payment_method,
            notes,
            created_at
        FROM reimbursements
        WHERE expense_id = ?
        ORDER BY id
        """,
        (expense_id,),
    ).fetchall()

    connection.close()

    return rows


def get_total_reimbursed(expense_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT COALESCE(SUM(amount), 0)
        FROM reimbursements
        WHERE expense_id = ?
        """,
        (expense_id,),
    ).fetchone()

    connection.close()

    return row[0]


def delete_reimbursement(reimbursement_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM reimbursements
        WHERE id = ?
        """,
        (reimbursement_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted