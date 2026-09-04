import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type LoadingStateProps = {
  label?: string;
  /** Compact layout for small inline cards. */
  compact?: boolean;
};

/** Loading placeholder used while a dashboard section fetches data. */
export function LoadingState({ label = 'Loading…', compact = false }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <ActivityIndicator color={theme.accent} size={compact ? 'small' : 'large'} />
      {label ? (
        <ThemedText style={styles.label} themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  compact: {
    paddingVertical: Spacing.three,
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
});
