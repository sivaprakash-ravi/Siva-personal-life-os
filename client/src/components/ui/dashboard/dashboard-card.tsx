import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Elevation, ElevationKey, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DashboardCardProps = PropsWithChildren<{
  /** Optional header row rendered above the card body. */
  title?: string;
  /** Secondary text on the right of the header row. */
  headerRight?: ReactNode;
  /** Underline-style accent bar at the top of the card. */
  accessory?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  elevation?: ElevationKey;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

/**
 * Base card container used across the dashboard. Handles the surface color,
 * border, radius, optional header and subtle elevation so every card is
 * visually consistent. Pass `onPress` to render an interactive card.
 */
export function DashboardCard({
  title,
  headerRight,
  accessory,
  elevation = 'card',
  onPress,
  style,
  contentStyle,
  children,
}: DashboardCardProps) {
  const theme = useTheme();

  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [enter]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 8 }],
  }));

  const color =
    accessory === 'success'
      ? theme.success
      : accessory === 'warning'
        ? theme.warning
        : accessory === 'danger'
          ? theme.danger
          : accessory === 'info'
            ? theme.info
            : theme.accent;

  const containerStyle = [
    styles.card,
    { backgroundColor: theme.surface, borderColor: theme.border },
    Elevation?.[elevation],
    style,
  ];

  const body = (
    <>
      {accessory ? (
        <View style={[styles.accessory, { backgroundColor: color }]} />
      ) : null}
      {title ? (
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle} themeColor="textSecondary">
            {title}
          </ThemedText>
          {headerRight ? (
            <View style={styles.headerRight}>{headerRight}</View>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.body, contentStyle]}>{children}</View>
    </>
  );

  let content: ReactNode;
  if (onPress) {
    content = (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
        ]}
      >
        {body}
      </Pressable>
    );
  } else {
    content = <View style={containerStyle}>{body}</View>;
  }

  return <Animated.View style={[styles.wrapper, enterStyle]}>{content}</Animated.View>;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Spacing.four - Spacing.half,
  },
  pressed: {
    opacity: 0.85,
  },
  accessory: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  body: {
    flexDirection: 'column',
  },
});
