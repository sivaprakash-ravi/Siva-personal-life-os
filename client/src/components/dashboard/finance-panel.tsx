import { StyleSheet, View } from 'react-native';

import { CategoryBars, type CategoryDatum } from '@/components/dashboard/category-bars';
import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FinanceDailyData = {
  date: string;
  expense_count: number;
  total_amount: number;
};

export type FinancePanelProps = {
  totalToday: number;
  expenseCount: number;
  categories: CategoryDatum[];
};

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Premium Finance module (coral). Renders today's total spending prominently
 * followed by a coral category-ranking chart. When there is no spending today
 * the header still stays premium and the chart simply doesn't render
 * (handled by the parent empty state).
 */
export function FinancePanel({ totalToday, expenseCount, categories }: FinancePanelProps) {
  const theme = useTheme();
  const hasSpending = totalToday > 0;

  return (
    <DashboardCard
      title="Finance"
      accessory="danger"
      headerRight={<StatusBadge label="Today" tone="danger" />}
      contentStyle={styles.content}
    >
      <View style={styles.totalRow}>
        <View>
          <View style={styles.amountLine}>
            <ThemedText
              style={[styles.amount, hasSpending && { color: theme.danger }]}
            >
              {hasSpending ? `₹${formatAmount(totalToday)}` : '₹0'}
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              {expenseCount > 0
                ? `${expenseCount} transaction${expenseCount === 1 ? '' : 's'} today`
                : 'No spending today'}
            </ThemedText>
          </View>
        </View>
      </View>

      {categories.length > 0 ? (
        <View style={styles.categoryBlock}>
          <ThemedText style={styles.categoryTitle} themeColor="textMuted">
            SPENDING BY CATEGORY
          </ThemedText>
          <CategoryBars categories={categories} limit={5} tone="danger" />
        </View>
      ) : null}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three },
  totalRow: {},
  amountLine: {
    gap: Spacing.one,
  },
  amount: {
    fontSize: 44,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  categoryBlock: {
    gap: Spacing.three,
  },
  categoryTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
});