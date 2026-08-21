from app.database.database import get_connection


def initialize_expense_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_date TEXT NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT,
            amount REAL NOT NULL,
            description TEXT,
            payment_method TEXT,
            source TEXT DEFAULT 'manual',
            merchant TEXT,
            transaction_reference TEXT,
            notes TEXT
        )
        """
    )

    columns = {
        row[1]
        for row in connection.execute(
            "PRAGMA table_info(expenses)"
        ).fetchall()
    }

    migrations = {
        "subcategory": """
            ALTER TABLE expenses
            ADD COLUMN subcategory TEXT
        """,
        "source": """
            ALTER TABLE expenses
            ADD COLUMN source TEXT DEFAULT 'manual'
        """,
        "merchant": """
            ALTER TABLE expenses
            ADD COLUMN merchant TEXT
        """,
        "transaction_reference": """
            ALTER TABLE expenses
            ADD COLUMN transaction_reference TEXT
        """,
    }

    for column, sql in migrations.items():
        if column not in columns:
            connection.execute(sql)

    connection.commit()
    connection.close()


def add_expense(
    expense_date,
    category,
    amount,
    subcategory=None,
    description=None,
    payment_method=None,
    source="manual",
    merchant=None,
    transaction_reference=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO expenses (
            expense_date,
            category,
            subcategory,
            amount,
            description,
            payment_method,
            source,
            merchant,
            transaction_reference,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            expense_date,
            category,
            subcategory,
            amount,
            description,
            payment_method,
            source,
            merchant,
            transaction_reference,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_expenses():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            expense_date,
            category,
            subcategory,
            amount,
            description,
            payment_method,
            source,
            merchant,
            transaction_reference,
            notes
        FROM expenses
        ORDER BY expense_date DESC, id DESC
        """
    ).fetchall()

    connection.close()

    return rows


def get_expenses_by_date(expense_date):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            expense_date,
            category,
            subcategory,
            amount,
            description,
            payment_method,
            source,
            merchant,
            transaction_reference,
            notes
        FROM expenses
        WHERE expense_date = ?
        ORDER BY id DESC
        """,
        (expense_date,),
    ).fetchall()

    connection.close()

    return rows


def delete_expense(expense_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM expenses
        WHERE id = ?
        """,
        (expense_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted