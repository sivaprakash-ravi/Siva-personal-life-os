/**
 * Shared type helpers for dashboard UI components.
 */

/** React Native's `flexDirection` union, re-exported for convenience. */
export type Direction =
  | 'row'
  | 'row-reverse'
  | 'column'
  | 'column-reverse';

/** Semantic statuses used across badges, progress and accents. */
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
