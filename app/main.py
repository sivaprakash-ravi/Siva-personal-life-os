from app.config import APP_ENV
from app.database.database import initialize_database
from app.database.meal_database import initialize_meals_table


def main():
    initialize_database()
    initialize_meals_table()

    print(f"Personal Life OS is running in: {APP_ENV}")


if __name__ == "__main__":
    main()