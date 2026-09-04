import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ProgressIndicatorProps = {
  value: number;
  /** Optional display text shown to the right (e.g. "68%"). */
  label?: string;
  /** Clamped to 0-100 by default. */
  max?: number;
  tone?: StatusTone;
  showLabel?: boolean;
  height?: number;
};

const TONE_KEYS: Record<StatusTone, 'accent' | 'success' | 'warning' | 'danger' | 'info'> = {
  neutral: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

/**
 * Thin horizontal progress bar with a subtle fill animation. Tracks the tone
 * color so it can double as a target/goal indicator.
 */
export function ProgressIndicator({
  value,
  label,
  max = 100,
  tone = 'neutral',
  showLabel = false,
  height = 7,
}: ProgressIndicatorProps) {
  const theme = useTheme();
  const colorKey = TONE_KEYS[tone];
  const color = theme[colorKey];

  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.track,
          { height, backgroundColor: theme.backgroundSelected },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, borderRadius: Radius.full },
            animatedStyle,
          ]}
        />
      </View>
      {showLabel || label ? (
        <ThemedText style={styles.label} themeColor="textSecondary">
          {label ?? `${Math.round(percent)}%`}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
  },
  track: {
    flex: 1,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
});
