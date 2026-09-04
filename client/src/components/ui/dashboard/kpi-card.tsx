import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type KpiCardProps = {
  label: string;
  value: ReactNode;
  /** Optional secondary/unit line shown beneath the value. */
  unit?: string;
  /** Optional delta/change text, e.g. "+12% vs last week". */
  delta?: string;
  tone?: StatusTone;
  icon?: ReactNode;
  onPress?: () => void;
};

const TONE_KEYS: Record<StatusTone, 'accent' | 'success' | 'warning' | 'danger' | 'info'> = {
  neutral: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

/**
 * Compact key-metric card. Designed to sit in a responsive grid: a single
 * column on phones and several columns on larger screens.
 */
export function KpiCard({
  label,
  value,
  unit,
  delta,
  tone = 'neutral',
  icon,
  onPress,
}: KpiCardProps) {
  const theme = useTheme();
  const colorKey = TONE_KEYS[tone];
  const accentColor = theme[colorKey];

  return (
    <DashboardCard
      onPress={onPress}
      contentStyle={styles.cardContent}
      style={styles.card}
      accessory={tone === 'neutral' ? undefined : colorKey}
    >
      <View style={styles.topRow}>
        <ThemedText style={styles.label} themeColor="textMuted">
          {label}
        </ThemedText>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
      </View>

      <View style={styles.valueRow}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        {unit ? (
          <ThemedText style={styles.unit} themeColor="textSecondary">
            {unit}
          </ThemedText>
        ) : null}
      </View>

      {delta ? (
        <ThemedText style={[styles.delta, { color: accentColor }]}>
          {delta}
        </ThemedText>
      ) : null}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
  },
  cardContent: {
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  icon: {
    marginLeft: Spacing.two,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one + Spacing.half,
  },
  value: {
    fontSize: FontSize.metric,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
  delta: {
    fontSize: FontSize.small,
    fontWeight: '700',
    marginTop: Spacing.half,
  },
});
