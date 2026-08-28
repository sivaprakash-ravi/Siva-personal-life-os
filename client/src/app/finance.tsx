import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://127.0.0.1:8000';

type DailyFinance = {
  date: string;
  expense_count: number;
  total_amount: number;
};

type MonthlyFinance = {
  month: string;
  expense_count: number;
  total_amount: number;
};

type MonthlyTotal = {
  monthly_total: number;
};

type FinanceInsights = {
  [key: string]: unknown;
};

export default function FinanceScreen() {
  const [daily, setDaily] = useState<DailyFinance | null>(null);
  const [monthly, setMonthly] = useState<MonthlyFinance | null>(null);
  const [total, setTotal] = useState<MonthlyTotal | null>(null);
  const [insights, setInsights] = useState<FinanceInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/finance/daily`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE_URL}/api/v1/finance/monthly`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE_URL}/api/v1/finance/total`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE_URL}/api/v1/finance/insights`).then((r) =>
        r.json(),
      ),
    ])
      .then(([dailyData, monthlyData, totalData, insightData]) => {
        setDaily(dailyData);
        setMonthly(monthlyData);
        setTotal(totalData);
        setInsights(insightData);
      })
      .catch((error) => {
        console.error('Finance API:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const monthlyAmount =
    total?.monthly_total ??
    monthly?.total_amount ??
    0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Finance</Text>
        <Text style={styles.subtitle}>
          Spending and financial activity.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.cardLabel}>TODAY</Text>
                <Text style={styles.date}>
                  {daily?.date ?? '—'}
                </Text>
              </View>

              <Text style={styles.status}>LIVE</Text>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                THIS MONTH
              </Text>

              <Text style={styles.heroValue}>
                ₹{formatAmount(monthlyAmount)}
              </Text>

              <Text style={styles.heroSubtext}>
                Total recorded spending
              </Text>
            </View>

            <View style={styles.grid}>
              <Metric
                title="Today's Spending"
                value={`₹${formatAmount(
                  daily?.total_amount ?? 0,
                )}`}
              />

              <Metric
                title="Today's Expenses"
                value={`${daily?.expense_count ?? 0}`}
              />

              <Metric
                title="Monthly Expenses"
                value={`${monthly?.expense_count ?? 0}`}
              />

              <Metric
                title="Monthly Total"
                value={`₹${formatAmount(monthlyAmount)}`}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Spending Overview
            </Text>

            <View style={styles.summaryCard}>
              <Detail
                title="Today"
                value={`₹${formatAmount(
                  daily?.total_amount ?? 0,
                )}`}
              />

              <Detail
                title="Today transactions"
                value={`${daily?.expense_count ?? 0}`}
              />

              <Detail
                title="This month"
                value={`₹${formatAmount(monthlyAmount)}`}
              />

              <Detail
                title="Monthly transactions"
                value={`${monthly?.expense_count ?? 0}`}
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Insights
            </Text>

            <View style={styles.insightCard}>
              {insights &&
              Object.keys(insights).length > 0 ? (
                Object.entries(insights)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <Detail
                      key={key}
                      title={formatLabel(key)}
                      value={formatInsightValue(value)}
                    />
                  ))
              ) : (
                <Text style={styles.emptyText}>
                  No spending insights available yet.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatInsightValue(value: unknown) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  return String(value ?? '—');
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Detail({
  title,
  value,
  last = false,
}: {
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.detailRowLast,
      ]}
    >
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  content: {
    padding: 24,
    paddingBottom: 120,
  },

  eyebrow: {
    color: '#7F8794',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 8,
  },

  subtitle: {
    color: '#929AA6',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },

  loader: {
    marginTop: 50,
  },

  dateCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  date: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },

  status: {
    color: '#55D69A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 24,
    marginBottom: 12,
  },

  heroLabel: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  heroValue: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 8,
  },

  heroSubtext: {
    color: '#929AA6',
    fontSize: 14,
    marginTop: 4,
  },

  grid: {
    gap: 12,
  },

  metricCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },

  metricTitle: {
    color: '#9AA1AC',
    fontSize: 14,
    fontWeight: '600',
  },

  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 32,
    marginBottom: 12,
  },

  summaryCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
  },

  insightCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
  },

  detailRow: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#242830',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailTitle: {
    color: '#929AA6',
    fontSize: 14,
    flex: 1,
  },

  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },

  emptyText: {
    color: '#7F8794',
    padding: 20,
    fontSize: 14,
  },
});