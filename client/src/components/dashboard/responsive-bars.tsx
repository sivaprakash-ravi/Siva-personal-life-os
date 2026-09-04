import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ResponsiveBarProps = {
  /** 0-100 fill. */
  percentage: number;
  color: string;
  /** Track height. */
  height?: number;
};

/**
 * Shared horizontally-animated proportion bar. Used by Health and Nutrition
 * modules to keep every comparison fill consistent and premium.
 */
export function HealthMetricBar({ percentage, color, height = 8 }: ResponsiveBarProps) {
  const theme = useTheme();
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(Math.min(Math.max(percentage, 0), 100), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, fill]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected, height }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
