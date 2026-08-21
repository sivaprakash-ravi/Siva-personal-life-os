from datetime import date


def calculate_next_expected_date(
    last_payment_date,
    frequency,
):
    from datetime import datetime

    current = datetime.strptime(
        last_payment_date,
        "%Y-%m-%d",
    ).date()

    if frequency == "monthly":
        month = current.month + 1
        year = current.year

        if month > 12:
            month = 1
            year += 1

        # Keep the same day where possible.
        import calendar

        day = min(
            current.day,
            calendar.monthrange(year, month)[1],
        )

        return date(
            year,
            month,
            day,
        ).isoformat()

    if frequency == "bi_monthly":
        month = current.month + 2
        year = current.year

        while month > 12:
            month -= 12
            year += 1

        import calendar

        day = min(
            current.day,
            calendar.monthrange(year, month)[1],
        )

        return date(
            year,
            month,
            day,
        ).isoformat()

    if frequency == "weekly":
        from datetime import timedelta

        return (
            current + timedelta(days=7)
        ).isoformat()

    return None


def get_recurrence_status(
    expected_date,
    payment_detected,
    today=None,
):
    if today is None:
        today = date.today()

    expected = date.fromisoformat(
        expected_date
    )

    if payment_detected:
        return "renewed"

    if today < expected:
        return "upcoming"

    if today == expected:
        return "due"

    return "overdue"