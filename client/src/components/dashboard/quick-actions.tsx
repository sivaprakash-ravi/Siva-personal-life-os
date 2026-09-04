import { Link } from 'expo-router';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type QuickActionDef = {
  key: string;
  label: string;
  hint?: string;
  /** Route to navigate to when the action maps to an existing screen. */
  href?: string;
  /** Optional callback for in-place actions (e.g. complete check-in). */
  onPress?: () => void;
  /** When true the action shows loading feedback. */
  loading?: boolean;
};

export type QuickActionsProps = {
  actions: QuickActionDef[];
  style?: ViewStyle;
};

/**
 * Compact grid of quick actions. Actions with an `href` navigate to the
 * existing feature screens; actions with `onPress` run an in-place action.
 */
export function QuickActions({ actions, style }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <DashboardCard title="Quick Actions" contentStyle={styles.grid} style={style}>
      {actions.map((action) => {
        const inner = (
          <View
            style={[
              styles.action,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              action.loading && styles.loading,
            ]}
          >
            <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
            {action.hint ? (
              <ThemedText style={styles.actionHint} themeColor="textMuted">
                {action.loading ? 'Working…' : action.hint}
              </ThemedText>
            ) : null}
          </View>
        );

        if (action.href) {
          return (
            <Link key={action.key} href={action.href as any} asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                {inner}
              </Pressable>
            </Link>
          );
        }

        return (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            disabled={action.loading}
            style={({ pressed }) => (pressed ? styles.pressed : undefined)}
          >
            {inner}
          </Pressable>
        );
      })}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.one,
  },
  action: {
    flexGrow: 1,
    flexBasis: '40%',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.one + Spacing.half,
  },
  actionLabel: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  actionHint: {
    fontSize: FontSize.small,
  },
  pressed: {
    opacity: 0.6,
  },
  loading: {
    opacity: 0.6,
  },
});
