import { StyleSheet, View } from 'react-native';

import { HealthMetricBar } from '@/components/dashboard/responsive-bars';
import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type HealthProgressData = {
  steps: number;
  steps_target: number;
  steps_percentage: number;
  water_ml: number;
  water_target: number;
  water_percentage: number;
  exercise_minutes: number;
  exercise_target: number;
  exercise_percentage: number;
  sleep_hours: number | null;
  sleep_target: number;
  sleep_percentage: number;
};

export type HealthPanelProps = {
  data: HealthProgressData;
};

type Metric = {
  key: string;
  label: string;
  glyph: string;
  value: string;
  target?: number;
  percentage: number;
  colorKey: ThemeColor;
};

/**
 * Premium Health module: each tracked metric renders as a comparison row
 * (current value vs target) with a tinted icon, an animated proportion bar and
 * a "Goal met" badge when the target is reached. The health panel is framed in
 * emerald, with individually meaningful tints for each metric.
 */
export function HealthPanel({ data }: HealthPanelProps) {
  const theme = useTheme();

  const metrics: Metric[] = [
    {
      key: 'steps',
      label: 'Steps',
      glyph: '👣',
      value: data.steps.toLocaleString(),
      target: data.steps_target,
      percentage: data.steps_percentage,
      colorKey: 'success',
    },
    {
      key: 'water',
      label: 'Water',
      glyph: '💧',
      value: `${data.water_ml} ml`,
      target: data.water_target,
      percentage: data.water_percentage,
      colorKey: 'info',
    },
    {
      key: 'exercise',
      label: 'Exercise',
      glyph: '🏃',
      value: `${data.exercise_minutes} min`,
      target: data.exercise_target,
      percentage: data.exercise_percentage,
      colorKey: 'warning',
    },
    ...(data.sleep_hours != null
      ? [
          {
            key: 'sleep',
            label: 'Sleep',
            glyph: '🌙',
            value: `${data.sleep_hours} hrs`,
            target: data.sleep_target,
            percentage: data.sleep_percentage,
            colorKey: 'violet' as ThemeColor,
          },
        ]
      : []),
  ];

  return (
    <DashboardCard
      title="Health"
      accessory="success"
      headerRight={
        <StatusBadge label="Today" tone="success" />
      }
      contentStyle={styles.content}
    >
      {metrics.map((m, i) => (
        <View
          key={m.key}
          style={[styles.row, i > 0 && { marginTop: Spacing.three }]}
        >
          <View style={styles.rowHeader}>
            <View
              style={[
                styles.icon,
                { backgroundColor: theme[`${m.colorKey}Soft` as ThemeColor], borderColor: `${theme[m.colorKey]}33` },
              ]}
            >
              <ThemedText style={styles.iconText} allowFontScaling={false}>
                {m.glyph}
              </ThemedText>
            </View>
            <View style={styles.labelWrap}>
              <View style={styles.labelLine}>
                <ThemedText style={styles.label}>{m.label}</ThemedText>
                <ThemedText style={styles.target} themeColor="textMuted">
                  {m.target && m.target > 0 ? `of ${m.target.toLocaleString()}` : ''}
                </ThemedText>
              </View>
              <ThemedText style={styles.value}>{m.value}</ThemedText>
            </View>
            <View style={styles.right}>
              {m.target && m.target > 0 && m.percentage >= 100 ? (
                <StatusBadge label="Goal met" tone="success" />
              ) : (
                <ThemedText style={[styles.pct, { color: theme[m.colorKey] }]}>
                  {Math.round(m.percentage)}%
                </ThemedText>
              )}
            </View>
          </View>
          <HealthMetricBar percentage={m.percentage} color={theme[m.colorKey]} />
        </View>
      ))}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three },
  row: {},
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    marginBottom: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 16,
    lineHeight: 20,
  },
  labelWrap: {
    flex: 1,
    minWidth: 0,
  },
  labelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },
  target: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.3,
    marginTop: Spacing.half,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: Spacing.two,
    maxWidth: 90,
  },
  pct: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.extrabold,
  },
});
