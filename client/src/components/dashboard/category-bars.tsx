import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CategoryDatum = {
  category: string;
  total_amount: number;
  expense_count: number;
};

export type CategoryBarsProps = {
  categories: CategoryDatum[];
  /** Limit how many categories render (e.g. top N). */
  limit?: number;
  /** Accent tone; defaults to coral (danger) to match the Finance semantic. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'violet';
  style?: ViewStyle;
};

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function label(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Horizontal category spending chart. Each row is a themed animated bar whose
 * width is proportional to that category's share of the largest category. All
 * bars share a single semantic accent (coral by default) so the chart reads as
 * one finance module, with the top category emphasised.
 */
export function CategoryBars({ categories, limit, tone = 'danger', style }: CategoryBarsProps) {
  const theme = useTheme();

  const data = (limit ? categories.slice(0, limit) : categories)
    .filter((item) => item.total_amount > 0);

  if (data.length === 0) {
    return null;
  }

  const color = theme[tone];

  const total = data.reduce((sum, item) => sum + item.total_amount, 0);
  const maxAmount = data.reduce((max, item) => Math.max(max, item.total_amount), 0);
  const topKey = data.reduce(
    (max, item) => (item.total_amount > max.total_amount ? item : max),
    data[0],
  ).category;

  return (
    <View style={[styles.container, style]}>
      {data.map((item) => {
        const share = total > 0 ? (item.total_amount / total) * 100 : 0;
        const isTop = item.category === topKey;
        return (
          <CategoryBarRow
            key={item.category}
            label={label(item.category)}
            amount={item.total_amount}
            widthRatio={maxAmount > 0 ? item.total_amount / maxAmount : 0}
            share={share}
            color={color}
            muted={theme.borderStrong}
            track={theme.backgroundSelected}
            isTop={isTop}
          />
        );
      })}
    </View>
  );
}

function CategoryBarRow({
  label: title,
  amount,
  widthRatio,
  share,
  color,
  muted,
  track,
  isTop,
}: {
  label: string;
  amount: number;
  widthRatio: number;
  share: number;
  color: string;
  muted: string;
  track: string;
  isTop: boolean;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(widthRatio, 0), 1) * 100, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [widthRatio, width]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  const fillColor = isTop ? color : muted;

  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <ThemedText style={[styles.label, isTop && { fontWeight: '800' }]} numberOfLines={1}>
          {isTop ? 'Top · ' : ''}
          {title}
        </ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: track }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: fillColor }, isTop && { backgroundColor: color }, animatedStyle]}
        />
      </View>

      <View style={styles.valueWrap}>
        <ThemedText style={[styles.amount, isTop && { color }]}>
          ₹{formatAmount(amount)}
        </ThemedText>
        <ThemedText style={styles.share} themeColor="textMuted">
          {Math.round(share)}%
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  labelWrap: {
    width: 96,
    flexShrink: 0,
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  valueWrap: {
    width: 84,
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FontSize.small,
    fontWeight: '800',
  },
  share: {
    fontSize: FontSize.tiny,
    fontWeight: '600',
    marginTop: Spacing.half,
  },
});
