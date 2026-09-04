import { useEffect } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type AnimatedNumberProps = {
  value: number;
  /** Text shown after the number, e.g. "%". */
  suffix?: string;
  /** Text shown before the number, e.g. "₹". */
  prefix?: string;
  /** Number of decimals to display. */
  decimals?: number;
  /** Duration of the count-up animation in ms. */
  duration?: number;
  style?: TextStyle | TextStyle[];
};

const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Counts up to `value` with a subtle easing animation. Used for KPI and hero
 * metrics so values feel alive without being distracting.
 */
export function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 800,
  style,
}: AnimatedNumberProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    const current = Math.round(progress.value * value * 100) / 100;
    return {
      text: `${prefix}${current.toFixed(decimals)}${suffix}`,
    } as any;
  });

  return <AnimatedText animatedProps={animatedProps} style={style} />;
}

export const styles = StyleSheet.create({});
