import { useEffect, useState } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

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

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts up to `value` with a subtle easing animation.
 *
 * Rendered with a plain requestAnimationFrame-driven state update instead of
 * reanimated `animatedProps`, because animated text props are not applied to
 * `<Text>` on react-native-web (the number would stay blank on web). Drives
 * identical behaviour on native and web.
 */
export function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 800,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(eased * value * 100) / 100);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <Text style={style} allowFontScaling={false}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </Text>
  );
}

export const styles = StyleSheet.create({});