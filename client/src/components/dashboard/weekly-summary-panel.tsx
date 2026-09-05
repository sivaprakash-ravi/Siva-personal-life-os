import { StyleSheet, View } from 'react-native';

import { WeeklyChart, type WeeklyDay } from '@/components/dashboard/weekly-chart';
import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type WeeklySummaryData = {
  start_date: string;
  end_date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
  current_streak: number;
  daily_summaries: WeeklyDay[];
};

export type WeeklySummaryPanelProps = {
  data: WeeklySummaryData;
  /** Optional date (YYYY-MM-DD) to emphasise as "today" in the chart. */
  todayDate?: string;
};

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function bestDayLabel(days: WeeklyDay[]): string {
  if (days.length === 0) return '—';
  const best = days.reduce(
    (max, day) => (day.completion_rate > max.completion_rate ? day : max),
    days[0],
  );
  if (days.length === 1) return 'Today';
  const parsed = new Date(`${best.date}T00:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return DAY_SHORT[new Date(best.date).getDay()] ?? '—';
}

/**
 * Premium Weekly summary module (insights/violet). Shows the weekly bar chart
 * with the current day emphasised, then a real-data stats row (week average,
 * best day, streak and completed/total). No fabricated period comparisons.
 */
export function WeeklySummaryPanel({ data, todayDate }: WeeklySummaryPanelProps) {
  const theme = useTheme();
  const days = data.daily_summaries ?? [];

  const highlightIndex = todayDate
    ? days.findIndex((d) => d.date === todayDate)
    : -1;

  const stats = [
    { label: 'Week avg', value: `${Math.round(data.completion_rate)}%` },
    { label: 'Best day', value: bestDayLabel(days) },
    ...(data.current_streak > 0
      ? [{ label: 'Streak', value: `${data.current_streak}d`, accent: true as const }]
      : [{ label: 'Tasks', value: `${data.completed}/${data.total}`, accent: false as const }]),
    { label: 'Completed', value: data.total > 0 ? `${data.completed}` : '—' },
  ];

  return (
    <DashboardCard
      title="This Week"
      headerRight={
        <ThemedText style={styles.range} themeColor="textMuted">
          {data.start_date} – {data.end_date}
        </ThemedText>
      }
      contentStyle={styles.content}
    >
      {days.length > 0 ? (
        <WeeklyChart days={days} highlightIndex={highlightIndex} />
      ) : null}

      <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
        {stats.map((s, i) => (
          <View key={s.label} style={styles.stat}>
            <ThemedText
              style={[
                styles.statValue,
                'accent' in s && s.accent ? { color: theme.violet } : undefined,
              ]}
            >
              {s.value}
            </ThemedText>
            <ThemedText style={styles.statLabel} themeColor="textMuted">
              {s.label}
            </ThemedText>
            {i < stats.length - 1 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three },
  range: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    paddingTop: Spacing.three,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  statValue: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.half,
  },
  divider: {
    position: 'absolute',
    right: 0,
    top: 2,
    bottom: 2,
    width: 1,
  },
});