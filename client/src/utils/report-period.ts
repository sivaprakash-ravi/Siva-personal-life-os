/**
 * Report period helpers — pure date math mirroring the backend
 * `app/services/report_service.py`:
 *   day   → the reference date itself
 *   week  → Monday–Sunday ISO week containing the reference date
 *   month → the calendar month containing the reference date
 *
 * All values are local-date 'YYYY-MM-DD' strings (no timezone shifting).
 */

import type { ReportType } from '@/services/api';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parses 'YYYY-MM-DD' as a local date. Returns null when malformed. */
export function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export interface ReportRange {
  start: string;
  end: string;
}

export function computeReportRange(
  reportType: ReportType,
  referenceDate: string,
): ReportRange {
  const reference = parseDateKey(referenceDate);
  if (!reference) {
    throw new Error(
      `Invalid reference date "${referenceDate}" (expected YYYY-MM-DD).`,
    );
  }

  if (reportType === 'day') {
    return { start: referenceDate, end: referenceDate };
  }

  if (reportType === 'week') {
    const mondayOffset = reference.getDay() === 0 ? 6 : reference.getDay() - 1;
    const monday = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate() - mondayOffset,
    );
    const sunday = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 6,
    );
    return { start: formatDateKey(monday), end: formatDateKey(sunday) };
  }

  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const last = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start: formatDateKey(first), end: formatDateKey(last) };
}

export function shiftReference(
  reportType: ReportType,
  referenceDate: string,
  delta: number,
): string {
  const reference = parseDateKey(referenceDate);
  if (!reference) return referenceDate;

  if (reportType === 'day') {
    return formatDateKey(
      new Date(
        reference.getFullYear(),
        reference.getMonth(),
        reference.getDate() + delta,
      ),
    );
  }

  if (reportType === 'week') {
    return formatDateKey(
      new Date(
        reference.getFullYear(),
        reference.getMonth(),
        reference.getDate() + delta * 7,
      ),
    );
  }

  return formatDateKey(
    new Date(
      reference.getFullYear(),
      reference.getMonth() + delta,
      1,
    ),
  );
}

export function formatReportRange(
  reportType: ReportType,
  range: ReportRange,
): string {
  if (reportType === 'month') {
    const start = parseDateKey(range.start);
    if (start) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    }
  }

  if (reportType === 'day' || range.start === range.end) {
    const start = parseDateKey(range.start);
    if (start) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`;
    }
    return range.start;
  }

  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  if (!start || !end) return `${range.start} – ${range.end}`;

  const startShort = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
  const endShort =
    `${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;

  return `${startShort} – ${endShort}`;
}

export function reportPdfFilename(
  reportType: ReportType,
  referenceDate: string,
): string {
  const range = computeReportRange(reportType, referenceDate);
  return `siva-os-report-${reportType}-${range.start}-${range.end}.pdf`;
}