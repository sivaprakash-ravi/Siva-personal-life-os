from datetime import date

from app.database.health_database import (
    add_health_record,
    get_health_records,
    get_health_records_by_date,
    delete_health_record,
)


VALID_SOURCES = {
    "manual",
    "smartwatch",
    "phone",
    "device",
}


def record_health(
    metric_type,
    value=None,
    unit=None,
    source="manual",
    notes=None,
    record_date=None,
):
    if source not in VALID_SOURCES:
        raise ValueError(
            f"Invalid health data source: {source}. "
            f"Allowed sources: {sorted(VALID_SOURCES)}"
        )

    if record_date is None:
        record_date = date.today().isoformat()

    add_health_record(
        record_date=record_date,
        metric_type=metric_type,
        value=value,
        unit=unit,
        source=source,
        notes=notes,
    )


def get_all_health_records():
    return get_health_records()


def get_today_health_records():
    return get_health_records_by_date(
        date.today().isoformat()
    )


def get_health_for_date(record_date):
    return get_health_records_by_date(
        record_date.isoformat()
    )


def remove_health_record(record_id):
    return delete_health_record(record_id)