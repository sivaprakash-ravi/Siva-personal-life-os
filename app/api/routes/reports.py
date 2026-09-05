from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services.report_service import (
    REPORT_TYPES,
    build_report_data,
    build_report_pdf,
    compute_report_range,
    parse_report_date,
    report_filename,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["reports"],
)


def _realize(report_type, date):
    if report_type not in REPORT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"report_type must be one of {', '.join(REPORT_TYPES)}; "
                f"got {report_type!r}"
            ),
        )

    try:
        parse_report_date(date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="date must be a valid YYYY-MM-DD value",
        ) from None


@router.get("/reports/summary")
def report_summary(report_type: str, date: str | None = None):
    """
    JSON summary of the data that will appear in a report. Intended for the
    client to preview the period before generating the PDF.
    """
    _realize(report_type, date)
    try:
        return build_report_data(report_type, date)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@router.get("/reports/pdf")
def report_pdf(report_type: str, date: str | None = None):
    """
    Generate and return a PDF report for the requested period.
    """
    _realize(report_type, date)

    try:
        reference = parse_report_date(date)
        start, end = compute_report_range(report_type, reference)
        data = build_report_data(report_type, reference)
        payload = build_report_pdf(data)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None

    filename = report_filename(data)

    return Response(
        content=payload,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "X-Report-Range": f"{start.isoformat()}..{end.isoformat()}",
        },
    )