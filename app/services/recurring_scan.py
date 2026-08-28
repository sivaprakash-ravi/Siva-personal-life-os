from app.services.recurring_dashboard import (
    get_recurring_dashboard,
)


def scan_recurring_payments():
    dashboard = get_recurring_dashboard()

    results = []

    for item in dashboard:
        results.append(
            {
                "id": item["id"],
                "name": item["name"],
                "category": item["category"],
                "amount": item["expected_amount"],
                "frequency": item["frequency"],
                "last_confirmed": item[
                    "last_confirmed_date"
                ],
                "next_expected": item[
                    "next_expected_date"
                ],
                "status": item["status"],
            }
        )

    return results


def get_action_required_recurring_payments():
    results = scan_recurring_payments()

    return [
        item
        for item in results
        if item["status"]
        in {
            "due",
            "overdue",
            "needs_confirmation",
        }
    ]


def get_recurring_summary():
    results = scan_recurring_payments()

    summary = {
        "total": len(results),
        "upcoming": 0,
        "due": 0,
        "overdue": 0,
        "renewed": 0,
        "awaiting_first_payment": 0,
        "action_required": 0,
    }

    for item in results:
        status = item["status"]

        if status in summary:
            summary[status] += 1

        if status in {"due", "overdue"}:
            summary["action_required"] += 1

    return summary