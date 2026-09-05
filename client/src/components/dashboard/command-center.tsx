import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedNumber } from '@/components/dashboard/animated-number';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CommandCenterChip = {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'danger' | 'accent' | 'muted' | 'neutral';
};

export type CommandCenterProps = {
  date?: string;
  name?: string;
  /**
   * Canonical 0-100 Today's Completion (see `utils/overall-completion`).
   * `null` means no data recorded yet today — the UI shows an honest
   * "No data yet" state instead of a fake 0.
   */
  completionRate: number | null;
  /** Breakdown chips (e.g. Daily/Health/Nutrition/Activity domain scores). */
  chips?: CommandCenterChip[];
  /** Small honest context line (e.g. "2 of 4 tasks done"). */
  note?: string;
};

function formatDate(isoDate?: string): string {
  if (!isoDate) return '';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function hourGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

/** Tick positions (%) for the subtle 25/50/75 gauge marks. */
const GAUGE_TICKS = [25, 50, 75] as const;

/** Rounded figure used for the % display. */
function roundRate(value: number): number {
  return Math.round(Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100));
}

function toneColor(
  tone: CommandCenterChip['tone'],
  theme: ReturnType<typeof useTheme>,
) {
  switch (tone) {
    case 'success':
      return theme.success;
    case 'warning':
      return theme.warning;
    case 'danger':
      return theme.danger;
    case 'accent':
      return theme.accent;
    case 'muted':
      return theme.textMuted;
    default:
      return theme.textSecondary;
  }
}

/**
 * "Today's Command Center" — the premium banner directly beneath the hero
 * carousel. Renders the greeting/date, a prominent animated completion figure,
 * a premium graduated gauge with tick marks and a travel marker, and the day's
 * domain breakdown chips.
 *
 * Connection state is intentionally NOT rendered here — the single "Connected"
 * indicator lives in `BrandHeader` so it never appears twice on screen.
 */
export function CommandCenter({
  date,
  name = 'Siva',
  completionRate,
  chips = [],
  note,
}: CommandCenterProps) {
  const theme = useTheme();
  const hasData = completionRate !== null && completionRate !== undefined;
  const clamped = hasData ? roundRate(completionRate!) : 0;

  const status = !hasData
    ? 'No data yet'
    : clamped >= 100
      ? 'Perfect day'
      : clamped >= 75
        ? 'On track'
        : clamped > 0
          ? 'In progress'
          : 'Not started';
  const statusColor = !hasData
    ? theme.textMuted
    : clamped >= 100 || clamped >= 75
      ? theme.success
      : clamped > 0
        ? theme.warning
        : theme.textMuted;

  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(hasData ? clamped : 0, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, hasData, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(fill.value, 0)}%`,
  }));

  const markerStyle = useAnimatedStyle(() => ({
    left: `${Math.max(fill.value, 0)}%`,
  }));

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.accentEdge,
          { backgroundColor: theme.accent, borderColor: theme.accentSoft },
        ]}
      />

      {/* Greeting */}
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <ThemedText style={styles.greetingLine} themeColor="textSecondary">
            {formatDate(date) || `Welcome back, ${name}`}
          </ThemedText>
          <ThemedText style={styles.greetingName}>
            {hourGreeting()}, {name}
          </ThemedText>
        </View>
        <View style={styles.statusChip}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {status}
          </ThemedText>
        </View>
      </View>

      {/* Prominent completion figure */}
      <View style={styles.figureRow}>
        <View style={styles.figure}>
          <View style={styles.figureValueRow}>
            {hasData ? (
              <>
                <AnimatedNumber value={clamped} style={[styles.figureValue, { color: theme.text }]} />
                <ThemedText style={[styles.figureUnit, { color: theme.accent }]}>%</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.figureNull}>—</ThemedText>
            )}
          </View>
          <ThemedText style={styles.figureLabel} themeColor="textMuted">
            TODAY'S COMPLETION
          </ThemedText>
        </View>
      </View>

      {note ? (
        <ThemedText style={styles.note} themeColor="textMuted">
          {note}
        </ThemedText>
      ) : null}

      {/* Premium graduated gauge */}
      <View style={[styles.barWrap, { backgroundColor: theme.backgroundSelected }]}>
        {GAUGE_TICKS.map((tick) => (
          <View
            key={tick}
            pointerEvents="none"
            style={[styles.barTick, { left: `${tick}%`, backgroundColor: theme.border }]}
          />
        ))}
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: hasData && clamped >= 100 ? theme.success : theme.accent },
            fillStyle,
          ]}
        />
        <Animated.View style={[styles.fillMarker, markerStyle]}>
          <View style={[styles.fillMarkerInner, { backgroundColor: '#FFFFFF', borderColor: theme.accent }]} />
        </Animated.View>
      </View>

      {/* Domain breakdown chips */}
      <View style={styles.breakdown}>
        {chips.map((chip) => (
          <View key={chip.label} style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: toneColor(chip.tone, theme) }]} />
            <View>
              <ThemedText style={styles.chipValue}>{chip.value}</ThemedText>
              <ThemedText style={styles.chipLabel} themeColor="textMuted">
                {chip.label}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    paddingTop: Spacing.four + Spacing.two,
    overflow: 'hidden',
    position: 'relative',
  },
  accentEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  greeting: {
    flexShrink: 1,
  },
  greetingLine: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  greetingName: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.one,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    marginTop: Spacing.half,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  figureRow: {
    marginTop: Spacing.four - Spacing.half,
  },
  figure: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  figureValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  figureValue: {
    fontSize: 56,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -2,
    lineHeight: 60,
  },
  figureNull: {
    fontSize: 56,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -2,
    lineHeight: 60,
    color: '#9BA1A6',
  },
  figureUnit: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    marginLeft: Spacing.one,
  },
  figureLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    alignSelf: 'flex-end',
    marginBottom: Spacing.two,
  },
  note: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.two,
  },
  barWrap: {
    height: 14,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.four - Spacing.half,
    position: 'relative',
  },
  barTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.6,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  fillMarker: {
    position: 'absolute',
    top: -4,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -11 }],
  },
  fillMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  breakdown: {
    flexDirection: 'row',
    marginTop: Spacing.four - Spacing.half,
    gap: Spacing.three,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
    flexGrow: 1,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  chipValue: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.3,
  },
  chipLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});