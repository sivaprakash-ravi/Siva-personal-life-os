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

type NutritionData = {
  date: string;
  calories: number;
  protein_grams: number;
  meals_expected: number;
  meals_completed: number;
  meals_pending: number;
};

export default function NutritionScreen() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/nutrition`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(setData)
      .catch((error) => console.error('Nutrition API:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>
          Meals, calories and protein in one place.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.cardLabel}>TODAY</Text>
                <Text style={styles.date}>{data?.date ?? '—'}</Text>
              </View>
              <Text style={styles.status}>LIVE</Text>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>DAILY INTAKE</Text>
              <Text style={styles.heroValue}>
                {data?.calories ?? 0}
                <Text style={styles.heroUnit}> kcal</Text>
              </Text>
              <Text style={styles.heroSubtext}>
                {data?.protein_grams ?? 0} g protein
              </Text>
            </View>

            <View style={styles.grid}>
              <Metric
                title="Calories"
                value={`${data?.calories ?? 0} kcal`}
              />
              <Metric
                title="Protein"
                value={`${data?.protein_grams ?? 0} g`}
              />
              <Metric
                title="Meals Completed"
                value={`${data?.meals_completed ?? 0}`}
              />
              <Metric
                title="Meals Pending"
                value={`${data?.meals_pending ?? 0}`}
              />
            </View>

            <Text style={styles.sectionTitle}>Meal Progress</Text>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Today's meals</Text>
                <Text style={styles.progressCount}>
                  {data?.meals_completed ?? 0}/
                  {data?.meals_expected ?? 0}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getMealProgress(
                        data?.meals_completed ?? 0,
                        data?.meals_expected ?? 0,
                      )}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {data?.meals_pending ?? 0} meals remaining
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Summary</Text>

            <View style={styles.summaryCard}>
              <Detail
                title="Expected meals"
                value={`${data?.meals_expected ?? 0}`}
              />
              <Detail
                title="Completed"
                value={`${data?.meals_completed ?? 0}`}
              />
              <Detail
                title="Pending"
                value={`${data?.meals_pending ?? 0}`}
              />
              <Detail
                title="Protein"
                value={`${data?.protein_grams ?? 0} g`}
                last
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getMealProgress(completed: number, expected: number) {
  if (expected <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completed / expected) * 100));
}

function Metric({ title, value }: { title: string; value: string }) {
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
  heroUnit: {
    color: '#929AA6',
    fontSize: 18,
    fontWeight: '600',
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
  progressCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  progressCount: {
    color: '#929AA6',
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#242830',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  progressText: {
    color: '#7F8794',
    fontSize: 13,
    marginTop: 10,
  },
  summaryCard: {
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
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});