import { StyleSheet, View } from 'react-native';

import { AnimatedNumber } from '@/components/dashboard/animated-number';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import type { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CommandCenterProps = {
  date?: string;
  name?: string;
  connected: boolean;
  completionRate: number;
  completed: number;
  pending: number;
  missed: number;
  total: number;
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

/**
 * "Today's Command Center" — the premium banner directly beneath the hero
 * carousel. Renders the greeting, date and connection state, a prominent
 * animated completion figure, a wide completion bar and the day's breakdown
 * (completed / pending / missed / total).
 */
export function CommandCenter({
  date,
  name = 'Siva',
  connected,
  completionRate,
  completed,
  pending,
  missed,
  total,
}: CommandCenterProps) {
  const theme = useTheme();
  const connectionTone: StatusTone = connected ? 'success' : 'danger';
  const breakdown: { label: string; value: number; color: string }[] = [
    { label: 'Completed', value: completed, color: theme.success },
    { label: 'Pending', value: pending, color: theme.warning },
    { label: 'Missed', value: missed, color: theme.danger },
    { label: 'Total', value: total, color: theme.accent },
  ];

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

      {/* Greeting + connection */}
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <ThemedText style={styles.greetingLine} themeColor="textSecondary">
            {formatDate(date) || `Welcome back, ${name}`}
          </ThemedText>
          <ThemedText style={styles.greetingName}>
            {hourGreeting()}, {name}
          </ThemedText>
        </View>
        <StatusBadge label={connected ? 'Connected' : 'Offline'} tone={connectionTone} />
      </View>

      {/* Prominent completion figure */}
      <View style={styles.figureRow}>
        <View style={styles.figure}>
          <View style={styles.figureValueRow}>
            <AnimatedNumber value={Math.round(completionRate)} style={styles.figureValue} />
            <ThemedText style={[styles.figureUnit, { color: theme.accent }]}>%</ThemedText>
          </View>
          <ThemedText style={styles.figureLabel} themeColor="textMuted">
            TODAY'S COMPLETION
          </ThemedText>
        </View>
      </View>

      <View style={[styles.barWrap, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.barFill,
            { width: `${completionRate}%`, backgroundColor: theme.accent },
          ]}
        />
      </View>

      {/* Breakdown chips */}
      <View style={styles.breakdown}>
        {breakdown.map((b) => (
          <View key={b.label} style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: b.color }]} />
            <View>
              <ThemedText style={styles.chipValue}>{b.value.toLocaleString()}</ThemedText>
              <ThemedText style={styles.chipLabel} themeColor="textMuted">
                {b.label}
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
  barWrap: {
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.four - Spacing.half,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
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
