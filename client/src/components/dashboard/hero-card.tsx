import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedNumber } from '@/components/dashboard/animated-number';
import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type HeroCardProps = {
  completionRate: number;
  completed: number;
  pending: number;
  missed: number;
  total: number;
};

function statusCopy(rate: number, total: number): { label: string; tone: StatusTone } {
  if (total === 0) return { label: 'No tasks yet', tone: 'neutral' };
  if (rate >= 100) return { label: 'All clear', tone: 'success' };
  if (rate >= 50) return { label: 'On track', tone: 'info' };
  return { label: 'In progress', tone: 'warning' };
}

/**
 * Hero "Today Overview" card. Presents the day's completion rate as the
 * primary metric with an animated value, a progress bar and a concise status.
 */
export function HeroCard({ completionRate, completed, pending, missed, total }: HeroCardProps) {
  const theme = useTheme();
  const copy = statusCopy(completionRate, total);
  const clamped = Math.min(Math.max(completionRate, 0), 100);

  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(clamped, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value}%`,
  }));

  return (
    <DashboardCard accessory="accent" contentStyle={styles.content}>
      <View style={styles.heroRow}>
        <View style={styles.heroNumber}>
          <View style={styles.valueRow}>
            <AnimatedNumber value={completionRate} suffix="%" style={styles.heroValue} />
          </View>
          <ThemedText style={styles.heroLabel} themeColor="textMuted">
            Today's completion
          </ThemedText>
        </View>

        <StatusBadge label={copy.label} tone={copy.tone} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <Animated.View
            style={[styles.fill, { backgroundColor: theme.accent }, fillStyle]}
          />
        </View>
      </View>

      <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
        <Stat label="Completed" value={completed} />
        <Stat label="Pending" value={pending} />
        <Stat label="Missed" value={missed} />
        <Stat label="Total" value={total} />
      </View>
    </DashboardCard>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel} themeColor="textMuted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  heroNumber: {
    flexShrink: 1,
  },
  valueRow: {
    alignItems: 'baseline',
  },
  heroValue: {
    fontSize: FontSize.hero + 12,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 64,
  },
  heroLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: Spacing.one,
  },
  progressBar: {
    marginTop: Spacing.three,
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderTopWidth: 1,
    paddingTop: Spacing.three,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.metric,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FontSize.tiny,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.half,
  },
});
