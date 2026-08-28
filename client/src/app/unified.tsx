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

type UnifiedData = {
  date: string;
  daily_life: {
    total: number;
    completed: number;
    pending: number;
    missed: number;
    completion_rate: number;
  };
  health: Record<string, any>;
  nutrition: Record<string, any>;
  finance: {
    date: string;
    expense_count: number;
    total_amount: number;
  };
  activities: any[];
  learning: null;
  gym: null;
};

export default function UnifiedScreen() {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/unified`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then(setData)
      .catch((error) => console.error('Unified API:', error))
      .finally(() => setLoading(false));
  }, []);

  const life = data?.daily_life;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>

        <Text style={styles.title}>Life Overview</Text>

        <Text style={styles.subtitle}>
          Everything important about today.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.dateCard}>
              <Text style={styles.cardLabel}>TODAY</Text>
              <Text style={styles.date}>
                {data?.date ?? '—'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Daily Life
            </Text>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                COMPLETION
              </Text>

              <Text style={styles.heroValue}>
                {(life?.completion_rate ?? 0).toFixed(0)}%
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        life?.completion_rate ?? 0,
                        100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.grid}>
              <Metric
                title="Completed"
                value={`${life?.completed ?? 0}`}
              />

              <Metric
                title="Pending"
                value={`${life?.pending ?? 0}`}
              />

              <Metric
                title="Missed"
                value={`${life?.missed ?? 0}`}
              />

              <Metric
                title="Total"
                value={`${life?.total ?? 0}`}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Health
            </Text>

            <View style={styles.card}>
              <Detail
                title="Steps"
                value={`${data?.health?.steps ?? 0}`}
              />

              <Detail
                title="Water"
                value={`${data?.health?.water_ml ?? 0} ml`}
              />

              <Detail
                title="Exercise"
                value={`${data?.health?.exercise_minutes ?? 0} min`}
              />

              <Detail
                title="Sleep"
                value={
                  data?.health?.sleep_hours != null
                    ? `${data.health.sleep_hours} hrs`
                    : '—'
                }
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Nutrition
            </Text>

            <View style={styles.card}>
              <Detail
                title="Calories"
                value={`${data?.nutrition?.calories ?? 0} kcal`}
              />

              <Detail
                title="Protein"
                value={`${data?.nutrition?.protein_grams ?? 0} g`}
              />

              <Detail
                title="Meals completed"
                value={`${data?.nutrition?.meals_completed ?? 0}`}
              />

              <Detail
                title="Meals pending"
                value={`${data?.nutrition?.meals_pending ?? 0}`}
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Finance
            </Text>

            <View style={styles.card}>
              <Detail
                title="Today's spending"
                value={`₹${formatAmount(
                  data?.finance?.total_amount ?? 0,
                )}`}
              />

              <Detail
                title="Expenses"
                value={`${data?.finance?.expense_count ?? 0}`}
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Activities
            </Text>

            <View style={styles.card}>
              {data?.activities?.length ? (
                data.activities.map((activity, index) => (
                  <Detail
                    key={index}
                    title={
                      activity?.[2] ||
                      activity?.activity_type ||
                      'Activity'
                    }
                    value={
                      activity?.[3] ||
                      activity?.venue ||
                      'Recorded'
                    }
                    last={
                      index ===
                      data.activities.length - 1
                    }
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No activities recorded today.
                </Text>
              )}
            </View>

            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>
                Siva OS V1
              </Text>

              <Text style={styles.footerText}>
                One unified record connecting your daily
                life, health, nutrition, finance and
                activities.
              </Text>
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

      <Text style={styles.detailValue}>
        {value}
      </Text>
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
    marginBottom: 8,
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

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 12,
  },

  heroCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
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
    marginTop: 6,
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#242830',
    borderRadius: 7,
    overflow: 'hidden',
    marginTop: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },

  metricCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 18,
  },

  metricTitle: {
    color: '#7F8794',
    fontSize: 13,
  },

  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 7,
  },

  card: {
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
    textAlign: 'right',
    maxWidth: '55%',
  },

  emptyText: {
    color: '#7F8794',
    padding: 20,
    fontSize: 14,
  },

  footerCard: {
    marginTop: 30,
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
  },

  footerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  footerText: {
    color: '#7F8794',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});