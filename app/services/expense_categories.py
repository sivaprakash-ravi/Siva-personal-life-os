EXPENSE_CATEGORIES = {
    "food": {
        "name": "Food",
        "subcategories": [
            "tiffin_breakfast",
            "lunch",
            "dinner",
            "snacks_tea_coffee",
            "food_delivery",
            "groceries",
        ],
    },
    "transport": {
        "name": "Transport",
        "subcategories": [
            "bus",
            "share_auto",
            "rapido",
            "ola_uber",
            "bike_fuel",
        ],
    },
    "living": {
        "name": "Living",
        "subcategories": [
            "rent_hostel",
            "electricity",
            "wifi",
            "mobile",
            "household",
        ],
    },
    "shopping": {
        "name": "Shopping",
        "subcategories": [
            "clothing",
            "electronics",
            "personal_items",
            "online_shopping",
        ],
    },
    "personal_care": {
        "name": "Personal Care",
        "subcategories": [
            "haircut",
            "hair_care",
            "skin_care",
            "grooming",
        ],
    },
    "health": {
        "name": "Health",
        "subcategories": [
            "medicine",
            "doctor_hospital",
            "health_products",
        ],
    },
    "entertainment": {
        "name": "Entertainment",
        "subcategories": [
            "movies",
            "games",
            "subscriptions",
            "events",
        ],
    },
    "education": {
        "name": "Education",
        "subcategories": [
            "courses",
            "books",
            "exams",
            "training",
        ],
    },
    "financial": {
        "name": "Financial",
        "subcategories": [
            "bank_charges",
            "loan_emi",
            "interest_fees",
        ],
    },
    "family": {
        "name": "Family",
        "subcategories": [
            "gifts",
        ],
    },
    "travel": {
        "name": "Travel",
        "subcategories": [
            "home_travel",
            "tickets",
            "family_travel",
            "travel_activities",
        ],
    },
    "other": {
        "name": "Other",
        "subcategories": [
            "uncategorized",
        ],
    },
}


def get_categories():
    return list(EXPENSE_CATEGORIES.keys())


def get_category_details(category):
    if category not in EXPENSE_CATEGORIES:
        raise ValueError(f"Invalid expense category: {category}")

    return EXPENSE_CATEGORIES[category]


def get_subcategories(category):
    return EXPENSE_CATEGORIES[category]["subcategories"]


def is_valid_category(category):
    return category in EXPENSE_CATEGORIES


def is_valid_subcategory(category, subcategory):
    if not is_valid_category(category):
        return False

    return subcategory in EXPENSE_CATEGORIES[category]["subcategories"]