from app.services.expense_allocation_service import (
    get_allocated_total,
)
from app.services.reimbursement_service import (
    get_reimbursed_amount,
)


def validate_expense_financials(
    expense_amount,
    expense_id,
):
    allocated = get_allocated_total(expense_id)
    reimbursed = get_reimbursed_amount(expense_id)

    if allocated > expense_amount:
        raise ValueError(
            f"Allocated amount ₹{allocated} "
            f"cannot exceed expense amount "
            f"₹{expense_amount}."
        )

    if reimbursed > expense_amount:
        raise ValueError(
            f"Reimbursed amount ₹{reimbursed} "
            f"cannot exceed expense amount "
            f"₹{expense_amount}."
        )

    return {
        "expense_amount": expense_amount,
        "allocated_amount": allocated,
        "reimbursed_amount": reimbursed,
        "unallocated_amount": max(
            expense_amount - allocated,
            0,
        ),
        "net_cost": max(
            expense_amount - reimbursed,
            0,
        ),
    }