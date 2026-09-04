import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  right?: ReactNode;
};

/**
 * Consistent section heading used to group dashboard content. Optional
 * `eyebrow` adds a small uppercase label above the title and `actionLabel`
 * renders a tappable link on the right.
 */
export function SectionHeader({
  title,
  eyebrow,
  actionLabel,
  onActionPress,
  right,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        {eyebrow ? (
          <ThemedText style={styles.eyebrow} themeColor="textMuted">
            {eyebrow}
          </ThemedText>
        ) : null}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      <View style={styles.right}>
        {right}
        {actionLabel ? (
          <Pressable
            onPress={onActionPress}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <View style={styles.action}>
              <ThemedText style={{ color: theme.accent }}>
                {actionLabel}
              </ThemedText>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  textColumn: {
    flexShrink: 1,
  },
  eyebrow: {
    fontSize: FontSize.tiny,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.half,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginLeft: Spacing.three,
  },
  action: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
  },
  pressed: {
    opacity: 0.6,
  },
});
