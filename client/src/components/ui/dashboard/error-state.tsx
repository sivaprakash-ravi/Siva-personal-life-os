import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ErrorStateProps = {
  message?: string;
  /** Optional callback to retry the failed request. */
  onRetry?: () => void;
  compact?: boolean;
};

/** Error placeholder shown when a dashboard section fails to load. */
export function ErrorState({
  message = 'Something went wrong while loading this section.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <ThemedText style={styles.title} themeColor="danger">
        Unable to load
      </ThemedText>
      <ThemedText style={styles.message} themeColor="textSecondary">
        {message}
      </ThemedText>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            { borderColor: theme.borderStrong },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={{ color: theme.accent }}>Retry</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  compact: {
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: FontSize.lead,
    fontWeight: '700',
  },
  message: {
    fontSize: FontSize.small,
    textAlign: 'center',
    marginTop: Spacing.one,
    maxWidth: 320,
  },
  button: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
