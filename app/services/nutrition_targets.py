from app.services.nutrition_summary import get_daily_nutrition_summary


DEFAULT_DAILY_CALORIE_TARGET = 2500
DEFAULT_DAILY_PROTEIN_TARGET = 100


def get_nutrition_targets():
    """
    Return the configured daily nutrition targets.
    """
    return {
        "calories": DEFAULT_DAILY_CALORIE_TARGET,
        "protein_grams": DEFAULT_DAILY_PROTEIN_TARGET,
    }


def get_daily_nutrition_progress():
    """
    Compare today's nutrition against the configured targets.
    """
    summary = get_daily_nutrition_summary()
    targets = get_nutrition_targets()

    calories_target = targets["calories"]
    protein_target = targets["protein_grams"]

    calories_percentage = (
        round((summary["calories"] / calories_target) * 100, 2)
        if calories_target
        else 0.0
    )

    protein_percentage = (
        round((summary["protein_grams"] / protein_target) * 100, 2)
        if protein_target
        else 0.0
    )

    return {
        "date": summary["date"],
        "calories": summary["calories"],
        "calorie_target": calories_target,
        "calorie_percentage": calories_percentage,
        "protein_grams": summary["protein_grams"],
        "protein_target": protein_target,
        "protein_percentage": protein_percentage,
        "meals_completed": summary["meals_completed"],
        "meals_expected": summary["meals_expected"],
        "meal_completion_rate": summary["meal_completion_rate"],
    }