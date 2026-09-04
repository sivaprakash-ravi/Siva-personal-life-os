import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type WeeklyDay = {
  date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
};

export type WeeklyChartProps = {
  days: WeeklyDay[];
  /** Index of the day to emphasize as "today" (last day when omitted). */
  highlightIndex?: number;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(isoDate: string, index: number): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return DAY_LABELS[index % DAY_LABELS.length] ?? '';
}

/**
 * Compact weekly completion bar chart. Each bar represents one day's
 * completion percentage; bars animate in height for a subtle entrance.
 */
export function WeeklyChart({ days, highlightIndex = -1 }: WeeklyChartProps) {
  const theme = useTheme();
  const activeIndex =
    highlightIndex >= 0 ? highlightIndex : Math.max(0, days.length - 1);

  if (days.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {days.map((day, index) => {
          const isActive = index === activeIndex;
          return (
            <Bar
              key={day.date}
              label={dayLabel(day.date, index)}
              percent={day.completion_rate}
              active={isActive}
              toneColor={theme.accent}
              mutedColor={theme.backgroundSelected}
              fillMuted={theme.borderStrong}
            />
          );
        })}
      </View>
    </View>
  );
}

function Bar({
  label,
  percent,
  active,
  toneColor,
  mutedColor,
  fillMuted,
}: {
  label: string;
  percent: number;
  active: boolean;
  toneColor: string;
  mutedColor: string;
  fillMuted: string;
}) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(Math.min(Math.max(percent, 0), 100), {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  const fillColor = active ? toneColor : fillMuted;

  return (
    <View style={styles.barColumn}>
      <View style={styles.markerArea}>
        {active ? (
          <View style={[styles.activeDot, { backgroundColor: toneColor }]} />
        ) : null}
      </View>
      <View style={[styles.barTrack, { backgroundColor: mutedColor }]}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: fillColor, borderRadius: Radius.sm },
            active && styles.activeFill,
            animatedStyle,
          ]}
        />
      </View>
      <ThemedText style={[styles.barLabel, active && { color: toneColor }]}>
        {label}
      </ThemedText>
      <ThemedText
        style={[styles.barValue, active && { color: toneColor }]}
        themeColor={active ? undefined : 'textSecondary'}
      >
        {Math.round(percent)}%
      </ThemedText>
      {active ? <View style={[styles.todayChip, { backgroundColor: `${toneColor}22` }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.one,
  },
  markerArea: {
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.one,
  },
  activeFill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  todayChip: {
    height: 3,
    width: 20,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  barTrack: {
    width: '100%',
    maxWidth: 34,
    height: 84,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  barLabel: {
    fontSize: FontSize.tiny,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
  barValue: {
    fontSize: FontSize.tiny,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
});
