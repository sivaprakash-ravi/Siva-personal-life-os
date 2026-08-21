from app.database.expense_allocation_database import (
    add_allocation,
    get_allocations_for_expense,
    get_total_allocated,
    delete_allocation,
)


def add_person_allocation(
    expense_id,
    person_name,
    amount,
    person_id=None,
):
    if not person_name:
        raise ValueError("Person name is required.")

    if amount <= 0:
        raise ValueError(
            "Allocation amount must be greater than 0."
        )

    return add_allocation(
        expense_id=expense_id,
        person_name=person_name,
        amount=amount,
        person_id=person_id,
    )


def get_expense_allocations(expense_id):
    return get_allocations_for_expense(
        expense_id
    )


def get_allocated_total(expense_id):
    return get_total_allocated(
        expense_id
    )


def validate_allocation_total(
    expense_id,
    expense_amount,
):
    allocated_total = get_allocated_total(
        expense_id
    )

    if round(allocated_total, 2) != round(
        expense_amount, 2
    ):
        raise ValueError(
            f"Allocation total ₹{allocated_total} "
            f"does not match expense amount "
            f"₹{expense_amount}."
        )

    return True


def remove_allocation(allocation_id):
    return delete_allocation(
        allocation_id
    )