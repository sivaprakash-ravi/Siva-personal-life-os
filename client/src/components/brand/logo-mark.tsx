import { StyleSheet, View, type ViewStyle } from 'react-native';

import { BRAND } from '@/constants/brand';
import { Radius } from '@/constants/theme';

export type LogoMarkProps = {
  /** Base size in px. Default 40. */
  size?: number;
  style?: ViewStyle;
};

/**
 * SIVA OS brand mark — a layered electric blue → cyan → violet glyph with a
 * white energy/lightning spark. Built purely from native primitives (no logo
 * or gradient dependency). Restrained, non-glowing, readable on dark.
 */
export function LogoMark({ size = 40, style }: LogoMarkProps) {
  const { blue, cyan, violet } = BRAND.colors;
  const r = Radius.lg * (size / 40);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: r },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="SIVA OS"
      accessible
    >
      {/* Layered tonal surfaces approximate a blue → cyan → violet gradient. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: blue, opacity: 0.92 }]} />
      <View
        style={[
          styles.cyanish,
          {
            backgroundColor: cyan,
            opacity: 0.5,
            height: size * 0.55,
            borderRadius: r,
          },
        ]}
      />
      <View style={[styles.violettish, { backgroundColor: violet, width: size * 0.6 }]} />

      {/* White energy/lightning spark. */}
      <View style={[styles.sparkWrap, { width: size, height: size }]}>
        <View
          style={[
            styles.spark,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.05,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyanish: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  violettish: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.35,
  },
  sparkWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    transform: [{ rotate: '45deg' }],
  },
});
