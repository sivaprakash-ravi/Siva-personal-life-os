import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand';
import {
  CommandCenter,
  FinancePanel,
  GlanceCard,
  HealthPanel,
  HeroCarousel,
  KpiGrid,
  NutritionPanel,
  QuickActions,
  SectionPanel,
  WeeklySummaryPanel,
  type WeeklyDay,
} from '@/components/dashboard';
import {
  DashboardCard,
  EmptyState,
} from '@/components/ui/dashboard';
import { ThemedText } from '@/components/themed-text';
import {
  HERO_AUTO_SCROLL_INTERVAL_MS,
  HERO_BRAND,
  HERO_SLIDES,
} from '@/constants/hero';
import { FontSize, FontWeight, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  completeCheckin,
  getDailySummary,
  getFinanceCategories,
  getFinanceDaily,
  getHealthProgress,
  getNutritionProgress,
  getRecurringDashboard,
  getTodayCheckins,
  getWeeklyDailySummary,
  undoCheckin,
} from '../services/api';

/* ---------------------------------------------------------------------------
 * API response types
 * ---------------------------------------------------------------------- */

type DailySummary = {
  date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
};

type WeeklySummary = {
  start_date: string;
  end_date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
  current_streak: number;
  daily_summaries: WeeklyDay[];
};

type CheckIn = {
  id: number;
  date: string;
  type: string;
  scheduled_time: string;
  completed_at: string | null;
  status: 'pending' | 'completed' | 'missed';
  notes: string | null;
};

type HealthProgress = {
  date: string;
  progress: {
    steps: number;
    steps_target: number;
    steps_percentage: number;
    water_ml: number;
    water_target: number;
    water_percentage: number;
    exercise_minutes: number;
    exercise_target: number;
    exercise_percentage: number;
    sleep_hours: number | null;
    sleep_target: number;
    sleep_percentage: number;
  };
};

type NutritionProgress = {
  date: string;
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

type FinanceDaily = {
  date: string;
  expense_count: number;
  total_amount: number;
};

type FinanceCategories = {
  categories: {
    category: string;
    total_amount: number;
    expense_count: number;
  }[];
};

type RecurringItem = {
  id: number;
  name: string;
  category: string;
  expected_amount: number;
  frequency: string;
  next_expected_date: string | null;
  status: string;
  active: boolean;
};

/* ---------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function badgeTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status.includes('overdue')) return 'danger';
  if (status.includes('due')) return 'warning';
  if (status.includes('upcoming') || status.includes('awaiting')) return 'neutral';
  if (status.includes('renewed')) return 'success';
  return 'neutral';
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/* ---------------------------------------------------------------------------
 * Main dashboard
 * ---------------------------------------------------------------------- */

export default function DashboardScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const glanceColumns = width >= 1024 ? 4 : 2;

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [health, setHealth] = useState<HealthProgress | null>(null);
  const [nutrition, setNutrition] = useState<NutritionProgress | null>(null);
  const [financeDaily, setFinanceDaily] = useState<FinanceDaily | null>(null);
  const [categories, setCategories] = useState<FinanceCategories | null>(null);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);

  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingNutrition, setLoadingNutrition] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [loadingRecurring, setLoadingRecurring] = useState(true);

  const [dailyError, setDailyError] = useState(false);
  const [weeklyError, setWeeklyError] = useState(false);
  const [healthError, setHealthError] = useState(false);
  const [nutritionError, setNutritionError] = useState(false);
  const [financeError, setFinanceError] = useState(false);
  const [recurringError, setRecurringError] = useState(false);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadDaily = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingDaily(true);
    setDailyError(false);
    try {
      const [summaryData, checkinsData] = await Promise.all([
        getDailySummary(),
        getTodayCheckins(),
      ]);
      setSummary(summaryData as DailySummary);
      const normalized = Array.isArray(checkinsData)
        ? checkinsData
        : (checkinsData as { value?: CheckIn[] }).value ?? [];
      setCheckins(normalized as CheckIn[]);
    } catch (error) {
      console.error('Dashboard daily:', error);
      setDailyError(true);
    } finally {
      setLoadingDaily(false);
    }
  }, []);

  const loadWeekly = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingWeekly(true);
    setWeeklyError(false);
    try {
      const data = (await getWeeklyDailySummary()) as WeeklySummary;
      setWeekly(data);
    } catch (error) {
      console.error('Dashboard weekly:', error);
      setWeeklyError(true);
    } finally {
      setLoadingWeekly(false);
    }
  }, []);

  const loadHealth = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingHealth(true);
    setHealthError(false);
    try {
      setHealth((await getHealthProgress()) as HealthProgress);
    } catch (error) {
      console.error('Dashboard health:', error);
      setHealthError(true);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  const loadNutrition = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingNutrition(true);
    setNutritionError(false);
    try {
      setNutrition((await getNutritionProgress()) as NutritionProgress);
    } catch (error) {
      console.error('Dashboard nutrition:', error);
      setNutritionError(true);
    } finally {
      setLoadingNutrition(false);
    }
  }, []);

  const loadFinance = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingFinance(true);
    setFinanceError(false);
    try {
      const [daily, cats] = await Promise.all([getFinanceDaily(), getFinanceCategories()]);
      setFinanceDaily(daily as FinanceDaily);
      setCategories(cats as FinanceCategories);
    } catch (error) {
      console.error('Dashboard finance:', error);
      setFinanceError(true);
    } finally {
      setLoadingFinance(false);
    }
  }, []);

  const loadRecurring = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingRecurring(true);
    setRecurringError(false);
    try {
      const data = (await getRecurringDashboard()) as RecurringItem[];
      setRecurring(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Dashboard recurring:', error);
      setRecurringError(true);
    } finally {
      setLoadingRecurring(false);
    }
  }, []);

  const refreshAll = useCallback(async (quiet = false) => {
    await Promise.all([
      loadDaily(quiet),
      loadWeekly(quiet),
      loadHealth(quiet),
      loadNutrition(quiet),
      loadFinance(quiet),
      loadRecurring(quiet),
    ]);
  }, [loadDaily, loadWeekly, loadHealth, loadNutrition, loadFinance, loadRecurring]);

  // Initial load shows spinners; every subsequent focus refresh is quiet so the
  // UI stays stable while synchronizing with other screens/mutations.
  const initialFocusDone = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const first = !initialFocusDone.current;
      initialFocusDone.current = true;
      refreshAll(first);
    }, [refreshAll]),
  );

  const toggleCheckin = async (checkin: CheckIn) => {
    try {
      setUpdatingId(checkin.id);
      if (checkin.status === 'completed') {
        await undoCheckin(checkin.id);
      } else {
        await completeCheckin(checkin.id);
      }
      await loadDaily(true);
      await loadWeekly(true);
    } catch (error) {
      console.error('Check-in update:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const completionRate = summary?.completion_rate ?? 0;
  const healthProgress = health?.progress;
  const categoriesList = categories?.categories ?? [];
  const pendingCheckin = checkins.find((c) => c.status === 'pending');
  const recentCheckins = checkins.filter(
    (c) => c.status === 'completed' || c.status === 'missed',
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          {/* -----------------------------------------------------------------
           * SIVA OS brand + Hero carousel + Command Center
           * --------------------------------------------------------------- */}
          <View style={styles.heroArea}>
            <BrandHeader connected={!dailyError} showTagline={isWide} />
            <View style={styles.heroGap}>
              <HeroCarousel
                slides={HERO_SLIDES}
                brand={HERO_BRAND}
                intervalMs={HERO_AUTO_SCROLL_INTERVAL_MS}
              />
            </View>
          </View>

          <View style={styles.section}>
            {loadingDaily ? (
              <DashboardCard>
                <ActivityIndicator color={theme.accent} />
              </DashboardCard>
            ) : dailyError ? (
              <DashboardCard>
                <EmptyState
                  title="Couldn't load today"
                  message="Check your connection and try again."
                />
              </DashboardCard>
            ) : (
              <CommandCenter
                date={summary?.date}
                connected={!dailyError}
                completionRate={Math.round(completionRate)}
                completed={summary?.completed ?? 0}
                pending={summary?.pending ?? 0}
                missed={summary?.missed ?? 0}
                total={summary?.total ?? 0}
              />
            )}
          </View>

          {/* -----------------------------------------------------------------
           * Today at a glance — colour-coded KPI cards
           * --------------------------------------------------------------- */}
          <View style={styles.section}>
            <ThemedText style={[styles.eyebrow, { color: theme.textMuted }]}>
              TODAY AT A GLANCE
            </ThemedText>
            <KpiGrid columns={glanceColumns}>
              <GlanceCard
                label="Daily"
                glyph="⚡"
                value={`${Math.round(completionRate)}%`}
                context={
                  summary?.total
                    ? `${summary.completed}/${summary.total} tasks done`
                    : 'No tasks'
                }
                progress={completionRate}
                tone="info"
              />
              <GlanceCard
                label="Health"
                glyph="💚"
                value={healthProgress ? `${healthProgress.steps.toLocaleString()}` : '0'}
                unit="steps"
                context={
                  healthProgress && healthProgress.steps_target
                    ? `${Math.round(healthProgress.steps_percentage)}% of target`
                    : undefined
                }
                progress={healthProgress?.steps_percentage ?? 0}
                tone="success"
              />
              <GlanceCard
                label="Nutrition"
                glyph="🔥"
                value={nutrition ? `${nutrition.calories.toLocaleString()}` : '0'}
                unit="kcal"
                context={
                  nutrition
                    ? `${Math.round(nutrition.calorie_percentage)}% of target`
                    : undefined
                }
                progress={nutrition?.calorie_percentage ?? 0}
                tone="warning"
              />
              <GlanceCard
                label="Spending"
                glyph="₹"
                value={
                  financeDaily
                    ? `₹${formatAmount(financeDaily.total_amount)}`
                    : '₹0'
                }
                unit="today"
                context={
                  financeDaily?.expense_count
                    ? `${financeDaily.expense_count} expenses`
                    : 'No spending'
                }
                progress={0}
                tone="danger"
              />
            </KpiGrid>
          </View>

          {/* -----------------------------------------------------------------
           * Data visualisation grid
           * --------------------------------------------------------------- */}

          {/* Daily / Weekly + Health — side-by-side on wide screens */}
          <View style={[isWide && styles.gridRow]}>
            <View style={[styles.section, isWide && styles.gridItemHalf]}>
              <SectionPanel
                title="Daily progress"
                eyebrow="LAST 7 DAYS"
                loading={loadingWeekly}
                error={weeklyError}
                showEmpty={!!weekly && weekly.daily_summaries.length === 0}
                emptyTitle="No weekly data yet"
                emptyMessage="Complete check-ins across the week to see your progress."
                onRetry={loadWeekly}
              >
                {weekly && weekly.daily_summaries.length > 0 ? (
                  <WeeklySummaryPanel data={weekly} todayDate={summary?.date} />
                ) : null}
              </SectionPanel>
            </View>

            <View style={[styles.section, isWide && styles.gridItemHalf]}>
              <SectionPanel
                title="Health"
                eyebrow="TODAY"
                loading={loadingHealth}
                error={healthError}
                showEmpty={
                  !!healthProgress &&
                  healthProgress.steps === 0 &&
                  healthProgress.water_ml === 0 &&
                  healthProgress.exercise_minutes === 0
                }
                emptyTitle="No health data today"
                emptyMessage="Record steps, water or exercise from the Health screen."
                onRetry={loadHealth}
              >
                {healthProgress ? <HealthPanel data={healthProgress} /> : null}
              </SectionPanel>
            </View>
          </View>

          {/* Nutrition + Spending — side-by-side on wide screens */}
          <View style={[isWide && styles.gridRow]}>
            <View style={[styles.section, isWide && styles.gridItemHalf]}>
              <SectionPanel
                title="Nutrition"
                eyebrow="TODAY"
                loading={loadingNutrition}
                error={nutritionError}
                showEmpty={
                  !!nutrition &&
                  nutrition.calories === 0 &&
                  nutrition.meals_completed === 0
                }
                emptyTitle="No meals recorded"
                emptyMessage="Add a meal from the Nutrition screen."
                onRetry={loadNutrition}
              >
                {nutrition ? <NutritionPanel data={nutrition} /> : null}
              </SectionPanel>
            </View>

            <View style={[styles.section, isWide && styles.gridItemHalf]}>
              <SectionPanel
                title="Finance"
                eyebrow="TODAY"
                loading={loadingFinance}
                error={financeError}
                showEmpty={
                  !!financeDaily && financeDaily.total_amount === 0
                }
                emptyTitle="No spending today"
                emptyMessage="Record expenses from the Finance screen."
                onRetry={loadFinance}
              >
                <FinancePanel
                  totalToday={financeDaily?.total_amount ?? 0}
                  expenseCount={financeDaily?.expense_count ?? 0}
                  categories={categoriesList}
                />
              </SectionPanel>
            </View>
          </View>

          {/* -----------------------------------------------------------------
           * Quick actions
           * --------------------------------------------------------------- */}
          <View style={styles.section}>
            <QuickActions
              actions={[
                {
                  key: 'checkin',
                  label: 'Complete check-in',
                  hint: pendingCheckin ? formatLabel(pendingCheckin.type) : 'All done',
                  onPress: pendingCheckin ? () => toggleCheckin(pendingCheckin) : undefined,
                  loading: updatingId !== null,
                },
                { key: 'health', label: 'Add health record', hint: 'Track a metric', href: '/health' },
                { key: 'nutrition', label: 'Add meal', hint: 'Log calories', href: '/nutrition' },
                { key: 'finance', label: 'Add expense', hint: 'Record spending', href: '/finance' },
              ]}
            />
          </View>

          {/* -----------------------------------------------------------------
           * Recent activity
           * --------------------------------------------------------------- */}
          <View style={styles.section}>
            <SectionPanel
              title="Recent activity"
              eyebrow="TODAY"
              loading={loadingDaily}
              error={dailyError}
              showEmpty={recentCheckins.length === 0}
              emptyTitle="No activity yet"
              emptyMessage="Your completed check-ins will appear here."
              onRetry={loadDaily}
            >
              <DashboardCard>
                {recentCheckins.length === 0 ? (
                  <EmptyState
                    title="No activity yet"
                    message="Your completed tasks will show up here."
                  />
                ) : (
                  recentCheckins.map((checkin) => (
                    <View
                      key={checkin.id}
                      style={[styles.activityRow, { borderBottomColor: theme.border }]}
                    >
                      <View
                        style={[
                          styles.activityDot,
                          {
                            backgroundColor:
                              checkin.status === 'completed'
                                ? theme.success
                                : theme.danger,
                          },
                        ]}
                      />
                      <View style={styles.activityInfo}>
                        <ThemedText style={styles.activityTitle}>
                          {formatLabel(checkin.type)}
                        </ThemedText>
                        <ThemedText style={styles.activityMeta} themeColor="textSecondary">
                          {checkin.status === 'completed' ? 'Completed' : 'Missed'} •{' '}
                          {checkin.scheduled_time}
                        </ThemedText>
                      </View>
                    </View>
                  ))
                )}
              </DashboardCard>
            </SectionPanel>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 56,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  contentWide: {
    maxWidth: 1440,
  },
  heroArea: {
    marginBottom: Spacing.three,
  },
  heroGap: {
    marginTop: Spacing.three,
  },
  section: {
    marginTop: Spacing.four,
  },
  eyebrow: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.three,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    flexWrap: 'wrap',
  },
  gridItemHalf: {
    flex: 1,
    minWidth: 300,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  activityMeta: {
    fontSize: FontSize.small,
    marginTop: Spacing.half,
  },
});