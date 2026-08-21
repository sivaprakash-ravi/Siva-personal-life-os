from app.database.activity_expense_database import (
    link_expense_to_activity,
    get_expenses_for_activity,
)

from app.services.expense_service import record_expense

from app.services.expense_allocation_service import (
    add_person_allocation,
)


def add_activity_expense(
    activity_id,
    amount,
    category,
    subcategory=None,
    description=None,
    payment_method="cash",
    source="manual",
    merchant=None,
    notes=None,
    allocations=None,
):
    """
    Create an expense and attach it to an activity.

    allocations:
        [
            {
                "person_id": None,
                "person_name": "You",
                "amount": 200,
            },
            {
                "person_id": 7,
                "person_name": "Arun",
                "amount": 200,
            },
        ]
    """

    expense_id = record_expense(
        amount=amount,
        category=category,
        subcategory=subcategory,
        description=description,
        payment_method=payment_method,
        source=source,
        merchant=merchant,
        notes=notes,
    )

    link_expense_to_activity(
        activity_id=activity_id,
        expense_id=expense_id,
        amount_paid=amount,
        notes=description,
    )

    if allocations:
        allocated_total = sum(
            allocation["amount"]
            for allocation in allocations
        )

        if round(allocated_total, 2) != round(
            amount, 2
        ):
            raise ValueError(
                f"Allocation total ₹{allocated_total} "
                f"does not match expense amount "
                f"₹{amount}."
            )

        for allocation in allocations:
            add_person_allocation(
                expense_id=expense_id,
                person_name=allocation["person_name"],
                amount=allocation["amount"],
                person_id=allocation.get("person_id"),
            )

    return expense_id


def get_activity_expenses(activity_id):
    return get_expenses_for_activity(
        activity_id
    )