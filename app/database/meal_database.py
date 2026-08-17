import sqlite3
from pathlib import Path


DATABASE_DIR = Path("data")
DATABASE_DIR.mkdir(exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "personal_life.db"


def get_connection():
    return sqlite3.connect(DATABASE_PATH)


def initialize_meals_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meal_date TEXT NOT NULL,
            meal_type TEXT NOT NULL,
            meal_time TEXT NOT NULL,
            description TEXT NOT NULL,
            calories INTEGER,
            protein_grams REAL,
            notes TEXT
        )
        """
    )

    connection.commit()
    connection.close()


def add_meal(
    meal_date,
    meal_type,
    meal_time,
    description,
    calories=None,
    protein_grams=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO meals (
            meal_date,
            meal_type,
            meal_time,
            description,
            calories,
            protein_grams,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            meal_date,
            meal_type,
            meal_time,
            description,
            calories,
            protein_grams,
            notes,
        ),
    )

    connection.commit()
    connection.close()


def get_meals():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            meal_date,
            meal_type,
            meal_time,
            description,
            calories,
            protein_grams,
            notes
        FROM meals
        ORDER BY meal_date DESC, meal_time DESC
        """
    ).fetchall()

    connection.close()

    return rows


def update_meal(
    meal_id,
    meal_type=None,
    meal_time=None,
    description=None,
    calories=None,
    protein_grams=None,
    notes=None,
):
    connection = get_connection()

    connection.execute(
        """
        UPDATE meals
        SET
            meal_type = COALESCE(?, meal_type),
            meal_time = COALESCE(?, meal_time),
            description = COALESCE(?, description),
            calories = COALESCE(?, calories),
            protein_grams = COALESCE(?, protein_grams),
            notes = COALESCE(?, notes)
        WHERE id = ?
        """,
        (
            meal_type,
            meal_time,
            description,
            calories,
            protein_grams,
            notes,
            meal_id,
        ),
    )

    connection.commit()

    rows_updated = connection.total_changes

    connection.close()

    return rows_updated


def delete_meal(meal_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM meals
        WHERE id = ?
        """,
        (meal_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted