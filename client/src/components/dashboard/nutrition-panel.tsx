import { StyleSheet, View } from 'react-native';

import { AnimatedNumber } from '@/components/dashboard/animated-number';
import { HealthMetricBar } from '@/components/dashboard/responsive-bars';
import { DashboardCard } from '@/components/ui/dashboard/dashboard-card';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import { ThemedText } from '@/components/themed-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type NutritionProgressData = {
  calories: number;
  calorie_target: number;
  calorie_percentage: number;
  protein_grams: number;
  protein_target: number;
  protein_percentage: number;
  meals_completed: number;
  meals_expected: number;
  meal_completion_rate: number;
};

export type NutritionPanelProps = {
  data: NutritionProgressData;
};

/**
 * Premium Nutrition module (amber). Calories are visually dominant: a large
 * animated kcal figure over its target, an amber proportion bar, then protein
 * and meals comparison rows.
 */
export function NutritionPanel({ data }: NutritionPanelProps) {
  const theme = useTheme();
  const caloriePct = Math.round(data.calorie_percentage);
  const proteinDone = data.protein_target > 0 && data.protein_percentage >= 100;
  const mealsDone = data.meals_expected > 0 && data.meals_completed >= data.meals_expected;

  return (
    <DashboardCard
      title="Nutrition"
      accessory="warning"
      headerRight={<StatusBadge label="Today" tone="warning" />}
      contentStyle={styles.content}
    >
      <View style={styles.calorieHead}>
        <View>
          <View style={styles.calValueRow}>
            <AnimatedNumber value={data.calories} style={styles.calValue} />
            <ThemedText style={styles.calUnit} themeColor="textSecondary">
              kcal
            </ThemedText>
          </View>
          <ThemedText style={styles.calTarget} themeColor="textMuted">
            of {data.calorie_target.toLocaleString()} kcal target
          </ThemedText>
        </View>
        <View style={styles.calPct}>
          <ThemedText style={[styles.calPctValue, { color: theme.warning }]}>
            {caloriePct}%
          </ThemedText>
          <ThemedText style={styles.calPctLabel} themeColor="textMuted">
            of goal
          </ThemedText>
        </View>
      </View>

      <View style={[styles.barWrap, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(Math.max(caloriePct, 0), 100)}%`, backgroundColor: theme.warning },
          ]}
        />
      </View>

      <View style={[styles.divider, { borderTopColor: theme.border }]} />

      <View style={styles.subRows}>
        <SubRow
          glyph="🥩"
          label="Protein"
          value={`${data.protein_grams} g`}
          target={data.protein_target > 0 ? `${data.protein_target} g` : undefined}
          percentage={data.protein_percentage}
          color={theme.info}
          done={proteinDone}
        />
        {data.meals_expected > 0 ? (
          <SubRow
            glyph="🍽️"
            label="Meals"
            value={`${data.meals_completed} / ${data.meals_expected}`}
            percentage={data.meal_completion_rate}
            color={theme.success}
            done={mealsDone}
          />
        ) : null}
      </View>
    </DashboardCard>
  );
}

function SubRow({
  glyph,
  label,
  value,
  target,
  percentage,
  color,
  done,
}: {
  glyph: string;
  label: string;
  value: string;
  target?: string;
  percentage: number;
  color: string;
  done: boolean;
}) {
  return (
    <View style={styles.subRow}>
      <ThemedText style={styles.subGlyph} allowFontScaling={false}>
        {glyph}
      </ThemedText>
      <View style={styles.subBody}>
        <View style={styles.subHeader}>
          <ThemedText style={styles.subLabel}>{label}</ThemedText>
          <ThemedText style={styles.subTarget} themeColor="textMuted">
            {target ? `${target} · ` : ''}{Math.round(percentage)}%
          </ThemedText>
        </View>
        <View style={styles.subValueLine}>
          <ThemedText style={styles.subValue}>{value}</ThemedText>
          {done ? <StatusBadge label="Goal met" tone="success" /> : null}
        </View>
        <HealthMetricBar percentage={percentage} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three },
  calorieHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  calValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calValue: {
    fontSize: 44,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  calUnit: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    marginLeft: Spacing.one,
  },
  calTarget: {
    fontSize: FontSize.small,
    marginTop: Spacing.one,
  },
  calPct: {
    alignItems: 'flex-end',
    marginBottom: Spacing.one,
  },
  calPctValue: {
    fontSize: FontSize.metric,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  calPctLabel: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.half,
  },
  barWrap: {
    height: 12,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  divider: {
    borderTopWidth: 1,
    marginVertical: Spacing.one,
  },
  subRows: {
    gap: Spacing.three,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  subGlyph: {
    fontSize: 18,
    lineHeight: 24,
  },
  subBody: {
    flex: 1,
    minWidth: 0,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subLabel: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },
  subTarget: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.medium,
  },
  subValueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  subValue: {
    fontSize: FontSize.lead,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.3,
  },
});
