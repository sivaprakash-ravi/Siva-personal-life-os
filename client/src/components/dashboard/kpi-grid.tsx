import { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type DimensionValue } from 'react-native';

import { Spacing } from '@/constants/theme';

export type KpiGridProps = {
  children: ReactNode;
  /** Explicit column count; defaults to a responsive value from width. */
  columns?: number;
  /** Minimum column width used to derive the responsive count. */
  minColumnWidth?: number;
};

/**
 * Responsive KPI grid. Distributes children across N columns based on the
 * available width: 1 column on phones, 2 on small tablets, 3/4 on desktop.
 * Uses percentage widths plus internal padding (no `calc`) so it renders
 * identically on web and native.
 */
export function KpiGrid({ children, columns, minColumnWidth = 224 }: KpiGridProps) {
  const { width } = useWindowDimensions();
  const cols = columns ?? Math.max(1, Math.min(Math.floor(width / minColumnWidth), 4));
  const itemWidth = `${(100 / cols).toFixed(4)}%` as DimensionValue;

  const items = Array.isArray(children) ? children : [children];

  return (
    <View style={styles.row}>
      {items.map((child, index) => (
        <View
          key={index}
          style={[
            styles.item,
            { width: itemWidth, paddingHorizontal: Spacing.three / 2 },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    marginHorizontal: -Spacing.three / 2,
  },
  item: {
    marginBottom: Spacing.three,
  },
});
