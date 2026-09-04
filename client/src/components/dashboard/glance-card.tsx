import { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type GlanceTone = 'info' | 'success' | 'warning' | 'danger' | 'violet';

export type GlanceCardProps = {
  label: string;
  /** Emoji/unicode glyph shown in the tinted icon container. */
  glyph: string;
  value: string;
  unit?: string;
  /** Secondary context line shown in the accent color. */
  context?: string;
  /** 0-100 progress fraction rendered as a tinted track. */
  progress?: number;
  tone: GlanceTone;
  onPress?: () => void;
};

const TONE_COLOR: Record<GlanceTone, ThemeColor> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  violet: 'violet',
};

const TONE_SOFT: Record<GlanceTone, ThemeColor> = {
  info: 'infoSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  violet: 'violetSoft',
};

/**
 * Colorful "Today at a Glance" card. Each card carries a semantic tone, a
 * tinted icon container, a big metric, a secondary context and an animated
 * progress track — distinct from the plain KpiCard so the four glance cards
 * read as rich, colour-coded modules.
 */
export function GlanceCard({
  label,
  glyph,
  value,
  unit,
  context,
  progress = 0,
  tone,
  onPress,
}: GlanceCardProps) {
  const theme = useTheme();
  const colorKey = TONE_COLOR[tone];
  const softKey = TONE_SOFT[tone];
  const color = theme[colorKey];
  const soft = theme[softKey];

  const clamped = Math.min(Math.max(Number.isFinite(progress) ? progress : 0, 0), 100);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(clamped, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value}%`,
  }));

  const body = (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.tint, { backgroundColor: soft }]} />
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: soft, borderColor: `${color}33` }]}>
          <ThemedText style={styles.iconText} allowFontScaling={false}>
            {glyph}
          </ThemedText>
        </View>
        <ThemedText style={styles.label} themeColor="textMuted">
          {label}
        </ThemedText>
      </View>

      <View style={styles.valueRow}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        {unit ? (
          <ThemedText style={styles.unit} themeColor="textSecondary">
            {unit}
          </ThemedText>
        ) : null}
      </View>

      {context ? (
        <ThemedText style={[styles.context, { color }]} numberOfLines={1}>
          {context}
        </ThemedText>
      ) : null}

      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: Radius.full }, fillStyle]} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three + Spacing.two,
    overflow: 'hidden',
    position: 'relative',
    flexGrow: 1,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 18,
    lineHeight: 22,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.three,
  },
  value: {
    fontSize: FontSize.metric + 2,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.8,
  },
  unit: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },
  context: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.one,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.three,
  },
  fill: {
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
});
