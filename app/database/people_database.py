from app.database.database import get_connection


def initialize_people_table():
    connection = get_connection()

    columns = {
        row[1]: row
        for row in connection.execute(
            "PRAGMA table_info(people)"
        ).fetchall()
    }

    if not columns:
        connection.execute(
            """
            CREATE TABLE people (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id TEXT UNIQUE,
                display_name TEXT NOT NULL,
                emoji TEXT,
                photo_uri TEXT,
                source TEXT NOT NULL DEFAULT 'manual',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

    else:
        contact_id_not_null = columns["contact_id"][3] == 1

        if contact_id_not_null:
            connection.execute(
                """
                ALTER TABLE people
                RENAME TO people_old
                """
            )

            connection.execute(
                """
                CREATE TABLE people (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contact_id TEXT UNIQUE,
                    display_name TEXT NOT NULL,
                    emoji TEXT,
                    photo_uri TEXT,
                    source TEXT NOT NULL DEFAULT 'manual',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            old_columns = {
                row[1]
                for row in connection.execute(
                    "PRAGMA table_info(people_old)"
                ).fetchall()
            }

            source_expression = (
                "source"
                if "source" in old_columns
                else "'contact'"
            )

            connection.execute(
                f"""
                INSERT INTO people (
                    id,
                    contact_id,
                    display_name,
                    emoji,
                    photo_uri,
                    source,
                    created_at
                )
                SELECT
                    id,
                    contact_id,
                    display_name,
                    emoji,
                    photo_uri,
                    {source_expression},
                    created_at
                FROM people_old
                """
            )

            connection.execute(
                """
                DROP TABLE people_old
                """
            )

        elif "source" not in columns:
            connection.execute(
                """
                ALTER TABLE people
                ADD COLUMN source TEXT DEFAULT 'manual'
                """
            )

    connection.commit()
    connection.close()


def add_person(
    display_name,
    contact_id=None,
    emoji=None,
    photo_uri=None,
    source="manual",
):
    if not display_name:
        raise ValueError("Display name is required.")

    if source not in {"contact", "manual"}:
        raise ValueError(
            "Person source must be 'contact' or 'manual'."
        )

    connection = get_connection()

    if contact_id:
        connection.execute(
            """
            INSERT OR REPLACE INTO people (
                contact_id,
                display_name,
                emoji,
                photo_uri,
                source
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                contact_id,
                display_name,
                emoji,
                photo_uri,
                source,
            ),
        )
    else:
        connection.execute(
            """
            INSERT INTO people (
                display_name,
                emoji,
                photo_uri,
                source
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                display_name,
                emoji,
                photo_uri,
                source,
            ),
        )

    connection.commit()
    connection.close()


def get_people():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            contact_id,
            display_name,
            emoji,
            photo_uri,
            source,
            created_at
        FROM people
        ORDER BY display_name
        """
    ).fetchall()

    connection.close()

    return rows


def get_person(person_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            id,
            contact_id,
            display_name,
            emoji,
            photo_uri,
            source,
            created_at
        FROM people
        WHERE id = ?
        """,
        (person_id,),
    ).fetchone()

    connection.close()

    return row


def delete_person(person_id):
    connection = get_connection()

    connection.execute(
        """
        DELETE FROM people
        WHERE id = ?
        """,
        (person_id,),
    )

    connection.commit()

    rows_deleted = connection.total_changes

    connection.close()

    return rows_deleted