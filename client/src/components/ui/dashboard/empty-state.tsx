import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

/** Friendly placeholder shown when a section has no data to display. */
export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <ThemedText style={styles.title}>{title}</ThemedText>
      {message ? (
        <ThemedText style={styles.message} themeColor="textSecondary">
          {message}
        </ThemedText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
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
  icon: {
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: FontSize.lead,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.body,
    textAlign: 'center',
    marginTop: Spacing.one,
    maxWidth: 320,
  },
  action: {
    marginTop: Spacing.four,
  },
});
