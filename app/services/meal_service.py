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
    if not description or not description.strip():
        raise ValueError("Meal description is required.")

    if calories is not None and calories < 0:
        raise ValueError("Calories must be greater than or equal to 0.")

    if protein_grams is not None and protein_grams < 0:
        raise ValueError("Protein must be greater than or equal to 0.")

    if not meal_type:
        raise ValueError("Meal type is required.")

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