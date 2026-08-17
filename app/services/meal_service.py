from app.database.meal_database import (
    initialize_meals_table,
    add_meal,
    get_meals,
    update_meal,
    delete_meal,
)


def initialize_meals():
    initialize_meals_table()


def record_meal(
    meal_date,
    meal_type,
    meal_time,
    description,
    calories=None,
    protein_grams=None,
    notes=None,
):
    add_meal(
        meal_date=meal_date,
        meal_type=meal_type,
        meal_time=meal_time,
        description=description,
        calories=calories,
        protein_grams=protein_grams,
        notes=notes,
    )


def get_all_meals():
    return get_meals()


def edit_meal(
    meal_id,
    meal_type=None,
    meal_time=None,
    description=None,
    calories=None,
    protein_grams=None,
    notes=None,
):
    return update_meal(
        meal_id=meal_id,
        meal_type=meal_type,
        meal_time=meal_time,
        description=description,
        calories=calories,
        protein_grams=protein_grams,
        notes=notes,
    )


def remove_meal(meal_id):
    return delete_meal(meal_id)