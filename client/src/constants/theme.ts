/**
 * SIVA OS design-token system.
 *
 * Central source of truth for color, spacing, radius, typography and
 * elevation. The UI should reference these tokens rather than scattering
 * hardcoded values across screens, so that switching themes, accent colors
 * and spacing is a single-point change.
 *
 * Dark mode is the primary visual direction for the dashboard.
 */

import '@/global.css';

import { Platform } from 'react-native';

/* ---------------------------------------------------------------------------
 * Color palette (semantic roles)
 *
 * Each role maps to a concrete color per scheme. Adding a role to BOTH the
 * light and dark palette automatically flows through `Colors`, `Theme` and the
 * `useTheme()` hook, keeping the existing themed components working.
 * ------------------------------------------------------------------------- */

const DarkPalette = {
  // App background & surfaces
  background: '#0A0C0E',
  backgroundElevated: '#12151A',
  surface: '#15181E',
  surfaceElevated: '#1B1F26',
  card: '#161A21',
  // Legacy aliases used by the starter themed components
  backgroundElement: '#15181E',
  backgroundSelected: '#232830',
  // Borders & dividers
  border: '#232830',
  borderStrong: '#2F3540',
  // Text
  text: '#F5F7FA',
  textSecondary: '#A7AFBB',
  textMuted: '#6B7480',
  // Semantic status / accent
  accent: '#5B8CFF',
  accentSoft: 'rgba(91, 140, 255, 0.16)',
  success: '#3DD68C',
  successSoft: 'rgba(61, 214, 140, 0.16)',
  warning: '#F5B84B',
  warningSoft: 'rgba(245, 184, 75, 0.16)',
  danger: '#F06A6A',
  dangerSoft: 'rgba(240, 106, 106, 0.16)',
  info: '#5B8CFF',
  infoSoft: 'rgba(91, 140, 255, 0.16)',
  // Insights / secondary (kept distinct from the blue accent)
  violet: '#A78BFA',
  violetSoft: 'rgba(167, 139, 250, 0.16)',
  overlay: 'rgba(0, 0, 0, 0.55)',
} as const;

const LightPalette = {
  // App background & surfaces
  background: '#F7F8FA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F2F5',
  card: '#FFFFFF',
  // Legacy aliases used by the starter themed components
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  // Borders & dividers
  border: '#E4E7EC',
  borderStrong: '#D3D8E0',
  // Text
  text: '#111418',
  textSecondary: '#555D68',
  textMuted: '#8A939E',
  // Semantic status / accent
  accent: '#3C6FFF',
  accentSoft: 'rgba(60, 111, 255, 0.12)',
  success: '#1FA971',
  successSoft: 'rgba(31, 169, 113, 0.12)',
  warning: '#C77A0A',
  warningSoft: 'rgba(199, 122, 10, 0.14)',
  danger: '#D64545',
  dangerSoft: 'rgba(214, 69, 69, 0.12)',
  info: '#3C6FFF',
  infoSoft: 'rgba(60, 111, 255, 0.12)',
  // Insights / secondary (kept distinct from the blue accent)
  violet: '#7C3AED',
  violetSoft: 'rgba(124, 58, 237, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

/**
 * Legacy `Colors` object consumed by `use-theme`, `themed-text` and
 * `themed-view`. Both palettes are guaranteed to share the same keys, so
 * `ThemeColor` (the intersection) includes every role above.
 */
export const Colors = {
  light: LightPalette,
  dark: DarkPalette,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** A concrete resolved color set for one scheme. */
export type Theme = typeof Colors.dark;

/* ---------------------------------------------------------------------------
 * Spacing scale
 * ------------------------------------------------------------------------- */

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  /** Compact gap used inside cards between stacked elements. */
  cardGap: 12,
} as const;

/* ---------------------------------------------------------------------------
 * Radius scale
 * ------------------------------------------------------------------------- */

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  /** Fully rounded (badges, pills). */
  full: 999,
} as const;

/* ---------------------------------------------------------------------------
 * Typography scale
 * ------------------------------------------------------------------------- */

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Font sizes used for the dashboard hierarchy. */
export const FontSize = {
  tiny: 10,
  caption: 11,
  small: 12,
  label: 13,
  body: 14,
  lead: 16,
  title: 22,
  metric: 28,
  hero: 38,
} as const;

/** Font weight presets. */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/* ---------------------------------------------------------------------------
 * Elevation / shadows
 * ------------------------------------------------------------------------- */

/**
 * Elevation presets. Web uses box-shadows; iOS/Android use material shadows.
 * Values are deliberately subtle to keep the dashboard calm.
 */
export const Elevation = Platform.select({
  web: {
    card: {
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      shadowOpacity: 0.35,
      elevation: 0,
    } as const,
    raised: {
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 24,
      shadowOpacity: 0.4,
      elevation: 0,
    } as const,
  },
  ios: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      shadowOpacity: 0.18,
    } as const,
    raised: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 24,
      shadowOpacity: 0.22,
    } as const,
  },
  android: {
    card: {
      elevation: 3,
    } as const,
    raised: {
      elevation: 8,
    } as const,
  },
  default: {
    card: {},
    raised: {},
  },
});

/** Key used to look up an elevation preset. */
export type ElevationKey = keyof NonNullable<typeof Elevation>;

/* ---------------------------------------------------------------------------
 * Layout / responsive
 * ------------------------------------------------------------------------- */

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Maximum content width on large/web screens before the layout centers. */
export const MaxContentWidth = 800;

/**
 * Responsive grid helpers. `columnsFor(width)` returns a sensible column
 * count for a KPI grid: 1 column on phones, 2 on small tablets, 3+ on desktop.
 */
export function columnsFor(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 540) return 2;
  return 1;
}
