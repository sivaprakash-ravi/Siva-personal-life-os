/**
 * Canonical overall-completion model for a day.
 *
 * Single source of truth for "Today's Completion". The dashboard's Command
 * Center figure, its domain chips, and the "Today at a Glance — Daily" card
 * all derive from the backend canonical overview (`GET /api/v1/daily/overview`)
 * so every widget agrees.
 *
 * The overview excludes Finance (it is not a completion domain) and marks each
 * domain as available/unavailable. Unavailable domains do not count toward the
 * percentage. Activity always reports unavailable by design (leisure/event
 * tracking has no measurable target). When no domain has data the overview
 * percentage is `null` and the UI shows an honest "No data yet" state.
 */

import type { DailyOverview, OverviewDomainKey } from '@/services/api';

export const OVERVIEW_DOMAIN_ORDER: OverviewDomainKey[] = [
  'daily',
  'health',
  'nutrition',
  'activity',
];

export const OVERVIEW_DOMAIN_LABELS: Record<OverviewDomainKey, string> = {
  daily: 'Daily',
  health: 'Health',
  nutrition: 'Nutrition',
  activity: 'Activity',
};

/** Validates the payload minimally; returns null when it cannot be trusted. */
export function normalizeOverview(
  overview: DailyOverview | null | undefined,
): DailyOverview | null {
  if (!overview) return null;
  if (!overview.domains || typeof overview.domains !== 'object') {
    return null;
  }
  return overview;
}

/**
 * Exact 0-100 percentage (unrounded), computed from available domains only.
 * Returns null when there is no data — never a fake 0.
 */
export function overallCompletion(
  overview: DailyOverview | null | undefined,
): number | null {
  const normalized = normalizeOverview(overview);
  if (!normalized) return null;

  const available = OVERVIEW_DOMAIN_ORDER.filter(
    (key) => normalized.domains[key]?.available,
  );

  if (available.length === 0) return null;

  let total = 0;
  let scored = 0;

  for (const key of available) {
    const percentage = normalized.domains[key]?.percentage;
    if (percentage === null || percentage === undefined) continue;
    total += 1;
    scored += percentage;
  }

  if (total <= 0) return null;

  return Math.min(Math.max(scored / total, 0), 100);
}

/** Rounded 0-100 percentage for display text (e.g. "68%"); null when no data. */
export function overallCompletionText(
  overview: DailyOverview | null | undefined,
): string | null {
  const value = overallCompletion(overview);
  if (value === null) return null;
  return `${Math.round(value)}%`;
}

/** Domain keys that carry real data on the given day (available and scored). */
export function availableDomainKeys(
  overview: DailyOverview | null | undefined,
): OverviewDomainKey[] {
  const normalized = normalizeOverview(overview);
  if (!normalized) return [];

  return OVERVIEW_DOMAIN_ORDER.filter((key) => {
    const domain = normalized.domains[key];
    return domain?.available && domain.percentage !== null && domain.percentage !== undefined;
  });
}

/**
 * Legacy check-in completion fallback (used only when the overview endpoint is
 * unreachable). Mirrors the old `/api/v1/daily` semantics so the widget still
 * shows the check-in figure instead of nothing.
 */
export type CompletionSource = {
  completed: number;
  total: number;
};

export function legacyCheckinCompletion(
  source: CompletionSource | null | undefined,
): number {
  if (!source) return 0;
  const total = Number.isFinite(source.total) ? source.total : 0;
  if (total <= 0) return 0;
  const completed = Number.isFinite(source.completed) ? source.completed : 0;
  const raw = (completed / total) * 100;
  return Math.min(Math.max(raw, 0), 100);
}

export function legacyCheckinCompletionText(
  source: CompletionSource | null | undefined,
): string | null {
  const total = source?.total ?? 0;
  if (total <= 0) return null;
  return `${Math.round(legacyCheckinCompletion(source))}%`;
}