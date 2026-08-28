from app.config import APP_ENV

from app.database.database import initialize_database
from app.database.meal_database import initialize_meals_table
from app.database.health_database import initialize_health_table
from app.database.day_type_database import initialize_day_type_table
from app.database.people_database import initialize_people_table
from app.database.expense_database import initialize_expense_table
from app.database.activity_database import initialize_activity_table
from app.database.activity_people_database import initialize_activity_people_table
from app.database.activity_expense_database import initialize_activity_expense_table
from app.database.expense_allocation_database import initialize_expense_allocation_table
from app.database.reimbursement_database import initialize_reimbursement_table
from app.database.recurring_database import initialize_recurring_table
from app.database.recurring_confirmation_database import initialize_confirmation_table


def initialize_all_databases():
    initialize_database()
    initialize_meals_table()
    initialize_health_table()
    initialize_day_type_table()
    initialize_people_table()
    initialize_expense_table()
    initialize_activity_table()
    initialize_activity_people_table()
    initialize_activity_expense_table()
    initialize_expense_allocation_table()
    initialize_reimbursement_table()
    initialize_recurring_table()
    initialize_confirmation_table()


def main():
    initialize_all_databases()

    print(f"Personal Life OS is running in: {APP_ENV}")


if __name__ == "__main__":
    main()