import { StyleSheet, View } from 'react-native';

import { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  /** Renders a small dot indicator alongside the label. */
  withDot?: boolean;
};

const SOFT_KEYS: Record<StatusTone, 'accentSoft' | 'successSoft' | 'warningSoft' | 'dangerSoft' | 'infoSoft'> = {
  neutral: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  info: 'infoSoft',
};

const COLOR_KEYS: Record<StatusTone, 'accent' | 'success' | 'warning' | 'danger' | 'info'> = {
  neutral: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

/**
 * Small pill badge for contextual status labels (e.g. "Overdue", "On track").
 * Uses a soft background plus a matching foreground/dot tone.
 */
export function StatusBadge({ label, tone = 'neutral', withDot = true }: StatusBadgeProps) {
  const theme = useTheme();
  const backgroundColor = theme[SOFT_KEYS[tone]];
  const color = theme[COLOR_KEYS[tone]];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {withDot ? (
        <View style={[styles.dot, { backgroundColor: color }]} />
      ) : null}
      <ThemedText style={[styles.label, { color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    paddingVertical: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: Radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '700',
  },
});
