"""
SIVA OS V1 High-Level Reports.

Generates Day / Week / Month reports from the actual stored data only.
Missing domains are reported honestly ("No data available for this period")
instead of showing fabricated metrics or zero-filled charts.

The aggregation layer (`build_report_data`) is domain-neutral and reused by the
`/api/v1/reports/summary` JSON endpoint; the PDF layer (`build_report_pdf`)
renders the same structure with reportlab.
"""

import calendar
import io
from datetime import date, datetime, timedelta

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.database.database import get_connection
from app.database.meal_database import get_meals
from app.services.activity_service import get_activities_for_date
from app.services.daily_summary import get_daily_summary
from app.services.health_service import get_health_for_date
from app.services.health_targets import get_health_targets
from app.services.meal_completion import EXPECTED_MEALS
from app.services.nutrition_targets import get_nutrition_targets
from app.services.overall_progress import get_daily_overview

REPORT_TYPES = ("day", "week", "month")

_METRIC_ALIASES = {
    "water_ml": "water",
    "weight_kg": "weight",
    "distance_km": "distance",
}

_DAYS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)

_MONTHS = (
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
)


# ---------------------------------------------------------------------------
# Date / range helpers
# ---------------------------------------------------------------------------


def parse_report_date(value):
    """
    Parse a YYYY-MM-DD reference date. Returns a `date` or raises ValueError.
    """
    if value is None:
        return date.today()
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


def compute_report_range(report_type, reference_date):
    """
    Return the inclusive (start, end) date range for a report type.

    - day:   the reference date itself
    - week:  the Monday-to-Sunday ISO week containing the reference date
    - month: the calendar month containing the reference date
    """
    reference = parse_report_date(reference_date)

    if report_type == "day":
        return reference, reference

    if report_type == "week":
        start = reference - timedelta(days=reference.weekday())
        return start, start + timedelta(days=6)

    if report_type == "month":
        start = reference.replace(day=1)
        last_day = calendar.monthrange(reference.year, reference.month)[1]
        return start, reference.replace(day=last_day)

    raise ValueError(
        f"report_type must be one of {', '.join(REPORT_TYPES)}; got {report_type!r}"
    )


def _human_date(value):
    return f"{value.day} {_MONTHS[value.month - 1]} {value.year}"


def _human_datetime(value):
    hours = value.hour
    minutes = value.minute
    period = "AM" if hours < 12 else "PM"
    hours_12 = hours % 12
    if hours_12 == 0:
        hours_12 = 12
    return (
        f"{value.day} {_MONTHS[value.month - 1]} {value.year}, "
        f"{hours_12}:{minutes:02d} {period}"
    )


def _fmt(value, suffix="", dash="\u2013"):
    if value is None:
        return dash
    return f"{value:g}{suffix}"


def _fmt_amount(value):
    return f"Rs. {value:,.2f}"


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------


def _read_health_for_date(day):
    """
    Read the raw health records for a day into a recorded-metric map.

    Uses the raw rows so a metric with no row for the day stays "absent"
    (None) instead of collapsing to the summary's numeric 0 default.
    """
    recorded = {}
    for row in get_health_for_date(day):
        metric = _METRIC_ALIASES.get(row[2], row[2])
        value = row[3]
        if value is not None:
            recorded[metric] = value
    return recorded


def _day_record(day, meals):
    iso = day.isoformat()

    overview = get_daily_overview(day)
    daily = get_daily_summary(day)

    day_meals = [meal for meal in meals if meal[1] == iso]
    recorded_types = {meal[2].lower() for meal in day_meals if meal[2]}
    meals_completed = len(EXPECTED_MEALS.intersection(recorded_types))

    health = _read_health_for_date(day)

    activities = get_activities_for_date(day)

    return {
        "date": iso,
        "weekday": _DAYS[day.weekday()],
        "checkin_total": daily["total"],
        "checkin_completed": daily["completed"],
        "overview_percentage": overview["percentage"],
        "available_domains": [
            key
            for key, domain in overview["domains"].items()
            if domain["available"]
        ],
        "unavailable_domains": [
            key
            for key, domain in overview["domains"].items()
            if not domain["available"]
        ],
        "meal_count": len(day_meals),
        "meals_completed": meals_completed,
        "meals_expected": len(EXPECTED_MEALS),
        "calories": sum(
            meal[5] for meal in day_meals if meal[5] is not None
        ),
        "protein_grams": round(
            sum(meal[6] for meal in day_meals if meal[6] is not None), 2
        ),
        "health": {
            "sleep_hours": (
                health["sleep_hours"] if "sleep_hours" in health else None
            ),
            "water_ml": health.get("water", 0),
            "steps": health.get("steps", 0),
            "exercise_minutes": health.get("exercise_minutes", 0),
            "distance_km": health.get("distance", 0),
            "recorded_metrics": len(health),
        },
        "activity_count": len(activities),
        "activities": [
            {
                "type": activity[2],
                "name": activity[3],
                "venue": activity[4],
                "location": activity[5],
            }
            for activity in activities
        ],
    }


def _stat(values):
    """{days_recorded, avg, min, max} for a list of recorded values."""
    if not values:
        return {
            "days_recorded": 0,
            "avg": None,
            "min": None,
            "max": None,
        }
    return {
        "days_recorded": len(values),
        "avg": round(sum(values) / len(values), 2),
        "min": min(values),
        "max": max(values),
    }


def _expenses_for_range(start_iso, end_iso):
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT
                expense_date,
                category,
                subcategory,
                amount
            FROM expenses
            WHERE expense_date BETWEEN ? AND ?
            ORDER BY expense_date ASC, id ASC
            """,
            (start_iso, end_iso),
        ).fetchall()
    finally:
        connection.close()
    return rows


def build_report_data(report_type, reference_date):
    """Aggregate real data for a report; returns a JSON-serializable dict."""
    if report_type not in REPORT_TYPES:
        raise ValueError(
            f"report_type must be one of {', '.join(REPORT_TYPES)}"
        )

    start, end = compute_report_range(report_type, reference_date)

    meals = get_meals()

    days = [
        _day_record(start + timedelta(days=offset), meals)
        for offset in range((end - start).days + 1)
    ]

    days_with_data = [
        day for day in days if day["overview_percentage"] is not None
    ]
    completion_values = [day["overview_percentage"] for day in days_with_data]

    checkin_total = sum(day["checkin_total"] for day in days)
    checkin_completed = sum(day["checkin_completed"] for day in days)

    health_aggregates = {}
    for key in ("sleep_hours", "water_ml", "steps", "exercise_minutes", "distance_km"):
        values = [
            day["health"][key]
            for day in days
            if day["health"][key] is not None and day["health"][key] > 0
        ]
        health_aggregates[key] = _stat(values)

    calories_values = [day["calories"] for day in days if day["calories"] > 0]
    protein_values = [
        day["protein_grams"] for day in days if day["protein_grams"] > 0
    ]

    nutrition = {
        "days_with_meals": sum(1 for day in days if day["meal_count"] > 0),
        "meals_completed": sum(day["meals_completed"] for day in days),
        "meals_expected_per_day": len(EXPECTED_MEALS),
        "calories_total": round(sum(calories_values), 2)
        if calories_values
        else 0,
        "calories_avg": (
            round(sum(calories_values) / len(calories_values), 2)
            if calories_values
            else None
        ),
        "protein_total": round(sum(protein_values), 2)
        if protein_values
        else 0,
        "protein_avg": (
            round(sum(protein_values) / len(protein_values), 2)
            if protein_values
            else None
        ),
    }

    expenses = _expenses_for_range(start.isoformat(), end.isoformat())

    category_totals = {}
    for row in expenses:
        category = row[1] or "Uncategorised"
        current = category_totals.setdefault(
            category, {"total_amount": 0.0, "expense_count": 0}
        )
        current["total_amount"] += row[3] or 0
        current["expense_count"] += 1

    expense_categories = [
        {
            "category": category,
            "total_amount": round(info["total_amount"], 2),
            "expense_count": info["expense_count"],
        }
        for category, info in sorted(
            category_totals.items(),
            key=lambda item: item[1]["total_amount"],
            reverse=True,
        )
    ]

    finance = {
        "expense_count": len(expenses),
        "total_amount": round(sum(row[3] or 0 for row in expenses), 2),
        "categories": expense_categories,
    }

    activity_records = [
        {
            "date": day["date"],
            "weekday": day["weekday"],
            "type": activity["type"],
            "name": activity["name"],
            "venue": activity["venue"],
        }
        for day in days
        for activity in day["activities"]
    ]

    activity = {
        "total": len(activity_records),
        "records": activity_records,
    }

    return {
        "report_type": report_type,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "days": days,
        "aggregates": {
            "checkins": {
                "total": checkin_total,
                "completed": checkin_completed,
            },
            "completion": {
                "days_with_data": len(days_with_data),
                "days_without_data": len(days) - len(days_with_data),
                "average_percentage": (
                    round(
                        sum(completion_values) / len(completion_values), 2
                    )
                    if completion_values
                    else None
                ),
            },
            "health": health_aggregates,
            "nutrition": nutrition,
            "finance": finance,
            "activity": activity,
        },
    }


def report_title(report_type):
    return {
        "day": "Day Report",
        "week": "Weekly Report",
        "month": "Monthly Report",
    }[report_type]


def report_filename(data):
    return (
        f"siva-os-report-{data['report_type']}-"
        f"{data['start_date']}-{data['end_date']}.pdf"
    )


# ---------------------------------------------------------------------------
# PDF rendering
# ---------------------------------------------------------------------------

# Brand palette (matches the client theme).
_NAVY = colors.HexColor("#0D1015")
_ACCENT = colors.HexColor("#5B8CFF")
_TEXT = colors.HexColor("#1C2230")
_MUTED = colors.HexColor("#6B7480")
_BORDER = colors.HexColor("#DCE1EA")
_BAND = colors.HexColor("#F4F6FA")
_GOOD = colors.HexColor("#2E9E6B")
_WARN = colors.HexColor("#C98A2D")
_BAD = colors.HexColor("#C2554E")


def _styles():
    base = getSampleStyleSheet()
    styles = {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=40,
            leading=44,
            textColor=colors.white,
            alignment=TA_LEFT,
        ),
        "cover_tagline": ParagraphStyle(
            "cover_tagline",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#AAB4C5"),
        ),
        "report_title": ParagraphStyle(
            "report_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            textColor=_TEXT,
        ),
        "range": ParagraphStyle(
            "range",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=13,
            leading=17,
            textColor=_MUTED,
        ),
        "section": ParagraphStyle(
            "section",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=_NAVY,
            spaceBefore=18,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=_ACCENT,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=_TEXT,
        ),
        "muted": ParagraphStyle(
            "muted",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=_MUTED,
        ),
        "note": ParagraphStyle(
            "note",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=_TEXT,
        ),
        "chart": ParagraphStyle(
            "chart",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.5,
            leading=12,
            textColor=_NAVY,
            spaceBefore=12,
            spaceAfter=2,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=_TEXT,
        ),
        "header": ParagraphStyle(
            "header",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white,
        ),
    }
    return styles


def _p(value, style):
    return Paragraph(str(value), style)


def _cell(value, style):
    return Paragraph(str(value), style)


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(_MUTED)
    canvas.drawString(
        42, 24, "SIVA OS - Build a Better Me | High-Level Report"
    )
    canvas.drawRightString(
        A4[0] - 42, 24, f"Page {doc.page}"
    )
    canvas.restoreState()


def _bar_chart(values, labels, fill_color=_ACCENT, max_value=None):
    drawing = Drawing(500, 120)
    chart = VerticalBarChart()
    chart.data = [values]
    chart.categoryAxis.categoryNames = labels
    chart.x = 30
    chart.y = 24
    chart.width = 440
    chart.height = 72
    chart.categoryAxis.labels.fontSize = 7
    chart.categoryAxis.labels.boxAnchor = "n"
    chart.categoryAxis.labels.dx = 0
    chart.categoryAxis.labels.dy = -2
    chart.valueAxis.valueMin = 0
    if max_value is not None:
        chart.valueAxis.valueMax = max_value
    chart.valueAxis.labels.fontSize = 7
    chart.valueAxis.labels.dy = -4
    chart.bars[0].fillColor = fill_color
    chart.bars[0].strokeWidth = 0
    drawing.add(chart)
    return drawing


def _pie_chart(values, labels):
    if not values or len(values) < 2:
        return None
    drawing = Drawing(200, 150)
    pie = Pie()
    pie.data = values
    pie.labels = labels
    pie.x = 95
    pie.y = 70
    pie.width = 110
    pie.height = 110
    pie.slices.strokeWidth = 0.5
    pie.slices.strokeColor = colors.white
    pie.slices.fontSize = 6
    palette = [
        colors.HexColor("#5B8CFF"),
        colors.HexColor("#2E9E6B"),
        colors.HexColor("#C98A2D"),
        colors.HexColor("#C2554E"),
        colors.HexColor("#8A63D2"),
        colors.HexColor("#3DA5A5"),
        colors.HexColor("#B06BB0"),
        colors.HexColor("#8892A0"),
    ]
    for index, color in enumerate(palette[: len(values)]):
        pie.slices[index].fillColor = color
    drawing.add(pie)
    return drawing


def _weekly_buckets(days, getter):
    """
    Bucket per-day values into week periods (W1..W5) for monthly charts,
    returning (labels, values) using the average of recorded values.

    Weeks without any recorded value are skipped entirely, so only bars with
    real data are drawn.
    """
    by_index = {}
    for day in days:
        value = getter(day)
        if value is None:
            continue
        week_index = (int(day["date"][8:10]) - 1) // 7
        by_index.setdefault(week_index, []).append(value)

    ordered = [(index, by_index[index]) for index in sorted(by_index)]

    labels = [f"W{index + 1}" for index, _ in ordered]
    values = [
        round(sum(items) / len(items), 1) for _, items in ordered
    ]
    return labels, values


def _data_table(header, rows, styles):
    """Build a wrapped, styled table with an accent header row."""
    header_row = [_cell(label, styles["header"]) for label in header]
    body = []
    for row in rows:
        body.append(
            [
                _cell(item, styles["cell"])
                for index, item in enumerate(row)
            ]
        )

    table = Table([header_row] + body, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), _NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.4, _BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _BAND]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def _honest_empty(styles):
    return Paragraph(
        "No data available for this period.",
        styles["body"],
    )


def _build_daily_section(data, styles, story, spend_by_day):
    days = data["days"]

    has_any = data["aggregates"]["completion"]["days_with_data"] > 0

    story.append(_p("Daily", styles["section"]))

    if not has_any:
        story.append(_honest_empty(styles))
        return

    if len(days) >= 2:
        if data["report_type"] == "month":
            labels, values = _weekly_buckets(
                days,
                lambda day: (
                    day["overview_percentage"]
                    if day["overview_percentage"] is not None
                    else None
                ),
            )
        else:
            labels = [
                f"{day['date'][8:10]} {_MONTHS[int(day['date'][5:7]) - 1][:3]}"
                for day in days
            ]
            values = [
                day["overview_percentage"]
                if day["overview_percentage"] is not None
                else 0
                for day in days
            ]

        story.append(
            Paragraph(
                "Overall daily completion % (recorded domains only)",
                styles["chart"],
            )
        )
        story.append(
            _bar_chart(values, labels, max_value=100)
        )

    header = [
        "Date",
        "Day",
        "Completion",
        "Tasks",
        "Meals",
        "Calories",
        "Spend",
        "Activity",
    ]
    rows = []
    for day in days:
        completion = (
            _fmt(day["overview_percentage"], "%")
            if day["overview_percentage"] is not None
            else "\u2013"
        )
        tasks = (
            f"{day['checkin_completed']}/{day['checkin_total']}"
            if day["checkin_total"] > 0
            else "\u2013"
        )
        meals = (
            f"{day['meals_completed']}/{day['meals_expected']}"
            if day["meal_count"] > 0
            else "\u2013"
        )
        spend = spend_by_day.get(day["date"], 0)
        rows.append(
            [
                day["date"],
                day["weekday"],
                completion,
                tasks,
                meals,
                _fmt(day["calories"]) if day["calories"] else "\u2013",
                _fmt_amount(spend) if spend else "\u2013",
                _fmt(day["activity_count"], " events")
                if day["activity_count"]
                else "\u2013",
            ]
        )
    story.append(_data_table(header, rows, styles))


def _spend_by_day(data):
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT expense_date, COALESCE(SUM(amount), 0)
            FROM expenses
            WHERE expense_date BETWEEN ? AND ?
            GROUP BY expense_date
            """,
            (data["start_date"], data["end_date"]),
        ).fetchall()
    finally:
        connection.close()
    return {row[0]: round(row[1], 2) for row in rows}


def _build_health_section(data, styles, story):
    days = data["days"]
    targets = get_health_targets()
    health_agg = data["aggregates"]["health"]

    recorded_days = sum(
        1 for day in days if day["health"]["recorded_metrics"] > 0
    )

    story.append(_p("Health", styles["section"]))
    story.append(
        Paragraph(
            "Daily targets: "
            f"sleep {targets['sleep_hours']:g} h | "
            f"water {targets['water_ml']:g} ml | "
            f"steps {targets['steps']:g} | "
            f"exercise {targets['exercise_minutes']:g} min",
            styles["muted"],
        )
    )

    if recorded_days == 0:
        story.append(_honest_empty(styles))
        return

    header = ["Date", "Sleep (h)", "Water (ml)", "Steps", "Exercise (min)", "Distance (km)"]
    rows = []
    for day in days:
        health = day["health"]
        rows.append(
            [
                day["date"],
                _fmt(health["sleep_hours"]),
                _fmt(health["water_ml"]) if health["water_ml"] else "\u2013",
                _fmt(health["steps"]) if health["steps"] else "\u2013",
                _fmt(health["exercise_minutes"])
                if health["exercise_minutes"]
                else "\u2013",
                _fmt(health["distance_km"])
                if health["distance_km"]
                else "\u2013",
            ]
        )
    story.append(_data_table(header, rows, styles))

    water_values = [
        day["health"]["water_ml"] for day in days if day["health"]["water_ml"]
    ]
    sleep_values = [
        day["health"]["sleep_hours"] for day in days if day["health"]["sleep_hours"]
    ]
    if water_values and len(days) >= 2:
        if data["report_type"] == "month":
            story.append(Paragraph("Average water consumption (ml / day)", styles["chart"]))
            bucket_labels, bucket_values = _weekly_buckets(
                days,
                lambda day: (
                    day["health"]["water_ml"]
                    if day["health"]["water_ml"]
                    else None
                ),
            )
            chart = _bar_chart(bucket_values, bucket_labels)
        else:
            story.append(Paragraph("Water consumption (ml / day)", styles["chart"]))
            labels = [d["date"][8:10] for d in days]
            chart = _bar_chart(
                [d["health"]["water_ml"] for d in days], labels
            )
        if chart is not None:
            story.append(chart)
    if sleep_values and len(days) >= 2:
        story.append(Paragraph("Sleep (hours / night)", styles["chart"]))
        if data["report_type"] == "month":
            bucket_labels, bucket_values = _weekly_buckets(
                days,
                lambda day: (
                    day["health"]["sleep_hours"]
                    if day["health"]["sleep_hours"]
                    else None
                ),
            )
            chart = _bar_chart(bucket_values, bucket_labels)
        else:
            labels = [d["date"][8:10] for d in days]
            chart = _bar_chart(
                [d["health"]["sleep_hours"] for d in days], labels
            )
        if chart is not None:
            story.append(chart)


def _build_nutrition_section(data, styles, story):
    days = data["days"]
    nutrition = data["aggregates"]["nutrition"]

    story.append(_p("Nutrition", styles["section"]))
    story.append(
        Paragraph(
            "Daily targets: "
            f"{nutrition['meals_expected_per_day']} core meals "
            "(breakfast, lunch, dinner)",
            styles["muted"],
        )
    )

    if nutrition["days_with_meals"] == 0:
        story.append(_honest_empty(styles))
        return

    story.append(
        Paragraph(
            "Recorded: "
            f"{nutrition['days_with_meals']} day(s) with meals, "
            f"{nutrition['meals_completed']} core meal(s) logged, "
            f"{_fmt(nutrition['calories_total'])} kcal total, "
            f"{_fmt(nutrition['protein_total'])} g protein total.",
            styles["note"],
        )
    )

    header = ["Date", "Meals logged", "Core meals", "Calories (kcal)", "Protein (g)"]
    rows = []
    for day in days:
        if day["meal_count"] == 0:
            continue
        rows.append(
            [
                day["date"],
                _fmt(day["meal_count"]),
                f"{day['meals_completed']}/{day['meals_expected']}",
                _fmt(day["calories"]) if day["calories"] else "\u2013",
                _fmt(day["protein_grams"])
                if day["protein_grams"]
                else "\u2013",
            ]
        )
    story.append(_data_table(header, rows, styles))

    if len(days) >= 2:
        story.append(Paragraph("Recorded calories (kcal / day)", styles["chart"]))
        if data["report_type"] == "month":
            bucket_labels, bucket_values = _weekly_buckets(
                days,
                lambda day: (
                    day["calories"] if day["calories"] else None
                ),
            )
        else:
            bucket_labels = [d["date"][8:10] for d in days]
            bucket_values = [day["calories"] for day in days]
        if any(v > 0 for v in bucket_values):
            story.append(_bar_chart(bucket_values, bucket_labels))


def _build_finance_section(data, styles, story, spend_by_day):
    days = data["days"]
    finance = data["aggregates"]["finance"]

    story.append(_p("Finance", styles["section"]))

    if finance["expense_count"] == 0:
        story.append(_honest_empty(styles))
        return

    story.append(
        Paragraph(
            f"Recorded {finance['expense_count']} expense(s) totalling "
            f"{_fmt_amount(finance['total_amount'])} in this period.",
            styles["note"],
        )
    )

    categories = finance["categories"]
    if categories:
        story.append(Paragraph("Spending by category", styles["h2"]))

        top = categories[:8]
        if len(categories) > 8:
            remainder_total = round(
                sum(c["total_amount"] for c in categories[8:]), 2
            )
            remainder_count = sum(c["expense_count"] for c in categories[8:])
            top.append(
                {
                    "category": "Other",
                    "total_amount": remainder_total,
                    "expense_count": remainder_count,
                }
            )

        header = ["Category", "Entries", "Amount", "Share"]
        rows = []
        for category in top:
            share = (
                (category["total_amount"] / finance["total_amount"]) * 100
                if finance["total_amount"]
                else 0
            )
            rows.append(
                [
                    category["category"].replace("_", " ").title(),
                    _fmt(category["expense_count"]),
                    _fmt_amount(category["total_amount"]),
                    f"{share:.1f}%",
                ]
            )
        story.append(_data_table(header, rows, styles))

        pie = _pie_chart(
            [c["total_amount"] for c in top],
            [c["category"][:12] for c in top],
        )
        if pie is not None:
            story.append(pie)

        if len(days) >= 2:
            story.append(Paragraph("Spending (Rs. / day)", styles["chart"]))
            if data["report_type"] == "month":
                bucket_labels, bucket_values = _weekly_buckets(
                    days,
                    lambda day: (
                        spend_by_day.get(day["date"], 0) or None
                    ),
                )
            else:
                bucket_labels = [d["date"][8:10] for d in days]
                bucket_values = [
                    spend_by_day.get(day["date"], 0) for day in days
                ]
            if any(v > 0 for v in bucket_values):
                story.append(
                    _bar_chart(bucket_values, bucket_labels)
                )


def _build_activity_section(data, styles, story):
    activity = data["aggregates"]["activity"]

    story.append(_p("Activity", styles["section"]))
    story.append(
        Paragraph(
            "Activity logs leisure and social events. It has no "
            "measurable daily completion target and is therefore reported "
            "as a record only.",
            styles["muted"],
        )
    )

    if activity["total"] == 0:
        story.append(_honest_empty(styles))
        return

    header = ["Date", "Day", "Type", "Detail"]
    rows = []
    for record in activity["records"]:
        detail = record["name"] or record["venue"] or ""
        rows.append(
            [
                record["date"],
                record["weekday"],
                record["type"].replace("_", " ").title(),
                detail if detail else "\u2013",
            ]
        )
    story.append(_data_table(header, rows, styles))


def _build_cover(data, styles, story):
    brand = Table(
        [
            [
                Paragraph("SIVA OS", styles["cover_title"]),
            ],
            [
                Paragraph("Build a Better Me", styles["cover_tagline"]),
            ],
        ],
        colWidths=[A4[0] - 84],
    )
    brand.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), _NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 40),
                ("RIGHTPADDING", (0, 0), (-1, -1), 40),
                ("TOPPADDING", (0, 0), (-1, -1), 22),
            ]
        )
    )
    story.append(brand)
    story.append(Spacer(1, 26))

    story.append(
        Paragraph(f"High-Level Report - {report_title(data['report_type'])}", styles["report_title"])
    )
    story.append(
        Paragraph(
            f"{_human_date(date.fromisoformat(data['start_date']))} - "
            f"{_human_date(date.fromisoformat(data['end_date']))}",
            styles["range"],
        )
    )
    story.append(
        Paragraph(
            f"Generated {_human_datetime(datetime.fromisoformat(data['generated_at']))}",
            styles["muted"],
        )
    )
    story.append(Spacer(1, 26))

    about = Table(
        [
            [
                Paragraph(
                    "This report is compiled exclusively from data recorded in "
                    "SIVA OS. Domains without recorded data are shown as "
                    "'No data available for this period' - nothing is "
                    "estimated, extrapolated or fabricated. Finance is "
                    "reported for awareness but is intentionally excluded "
                    "from the daily completion score.",
                    styles["note"],
                )
            ]
        ],
        colWidths=[A4[0] - 84],
    )
    about.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), _BAND),
                ("BOX", (0, 0), (-1, -1), 0.5, _BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(about)
    story.append(PageBreak())


def _build_executive_summary(data, styles, story):
    aggregates = data["aggregates"]

    story.append(_p("Executive Summary", styles["section"]))
    story.append(
        Paragraph(
            f"Period: {_human_date(date.fromisoformat(data['start_date']))} - "
            f"{_human_date(date.fromisoformat(data['end_date']))}.",
            styles["note"],
        )
    )
    story.append(Spacer(1, 6))

    completion = aggregates["completion"]
    checkins = aggregates["checkins"]
    health = aggregates["health"]
    nutrition = aggregates["nutrition"]
    finance = aggregates["finance"]
    activity = aggregates["activity"]

    kpis = [
        (
            "Daily completion",
            _fmt(completion["average_percentage"], "%")
            if completion["average_percentage"] is not None
            else "No data",
        ),
        (
            "Days recorded",
            f"{completion['days_with_data']} of {len(data['days'])}",
        ),
        (
            "Check-ins",
            f"{checkins['completed']} of {checkins['total']}"
            if checkins["total"]
            else "No check-ins scheduled",
        ),
        (
            "Health metrics",
            _fmt(health["water_ml"]["days_recorded"], " day(s)")
            if health["water_ml"]["days_recorded"]
            else "No data",
        ),
        (
            "Meals logged",
            f"{nutrition['meals_completed']} core meal(s)"
            if nutrition["days_with_meals"]
            else "No data",
        ),
        (
            "Calories",
            _fmt(nutrition["calories_total"]) + " kcal"
            if nutrition["days_with_meals"]
            else "No data",
        ),
        (
            "Spending",
            _fmt_amount(finance["total_amount"])
            if finance["expense_count"]
            else "No data",
        ),
        (
            "Activities",
            _fmt(activity["total"])
            if activity["total"]
            else "No data",
        ),
    ]

    kpi_rows = [[label, value] for label, value in kpis]
    table = Table(kpi_rows, colWidths=[110, 200], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.4, _BORDER),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, _BAND]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    for index, row in enumerate(kpi_rows):
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, index), (0, index), _NAVY),
                ]
            )
        )
    table.setStyle(
        TableStyle(
            [
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 8))

    story.append(
        Table(
            [
                [
                    Paragraph(
                        "Data integrity: only real captured data is shown. "
                        "If a domain has no records for the whole period you "
                        "will see a 'no data' notice instead of a "
                        "placeholder metric.",
                        styles["muted"],
                    )
                ]
            ],
            colWidths=[A4[0] - 84],
        )
    )
    story.append(PageBreak())


def build_report_pdf(data):
    """Render the aggregated report to PDF bytes."""
    styles = _styles()
    story = []

    _build_cover(data, styles, story)
    _build_executive_summary(data, styles, story)

    # Per-day spend, drawn once from a single range query so the Daily table
    # and the Finance chart always agree.
    spend_by_day = _spend_by_day(data)

    _build_daily_section(data, styles, story, spend_by_day)
    _build_health_section(data, styles, story)
    _build_nutrition_section(data, styles, story)
    _build_finance_section(data, styles, story, spend_by_day)
    _build_activity_section(data, styles, story)

    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=42,
        rightMargin=42,
        topMargin=46,
        bottomMargin=42,
        title=f"SIVA OS {report_title(data['report_type'])}",
        author="SIVA OS",
    )
    document.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buffer.getvalue()