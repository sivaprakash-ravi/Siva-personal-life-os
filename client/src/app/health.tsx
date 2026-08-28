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

type HealthData = {
  date: string;
  sleep_hours: number | null;
  weight_kg: number | null;
  water_ml: number;
  steps: number;
  distance_km: number;
  active_calories: number;
  heart_rate: number | null;
  resting_heart_rate: number | null;
  spo2: number | null;
  stress: number | null;
  energy: number | null;
  mood: number | null;
  exercise_minutes: number;
};

export default function HealthScreen() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(setData)
      .catch((error) => console.error('Health API:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Health</Text>
        <Text style={styles.subtitle}>
          Your health metrics in one place.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.cardTitle}>TODAY</Text>
                <Text style={styles.date}>{data?.date ?? '—'}</Text>
              </View>
              <Text style={styles.status}>LIVE</Text>
            </View>

            <View style={styles.grid}>
              <Metric title="Steps" value={`${data?.steps ?? 0}`} />
              <Metric
                title="Exercise"
                value={`${data?.exercise_minutes ?? 0} min`}
              />
              <Metric
                title="Water"
                value={`${data?.water_ml ?? 0} ml`}
              />
              <Metric
                title="Sleep"
                value={
                  data?.sleep_hours != null
                    ? `${data.sleep_hours} hrs`
                    : '—'
                }
              />
              <Metric
                title="Distance"
                value={`${data?.distance_km ?? 0} km`}
              />
              <Metric
                title="Active Calories"
                value={`${data?.active_calories ?? 0} kcal`}
              />
            </View>

            <Text style={styles.sectionTitle}>Body & Vitals</Text>

            <View style={styles.list}>
              <Detail
                title="Weight"
                value={
                  data?.weight_kg != null
                    ? `${data.weight_kg} kg`
                    : '—'
                }
              />
              <Detail
                title="Heart Rate"
                value={
                  data?.heart_rate != null
                    ? `${data.heart_rate} bpm`
                    : '—'
                }
              />
              <Detail
                title="Resting Heart Rate"
                value={
                  data?.resting_heart_rate != null
                    ? `${data.resting_heart_rate} bpm`
                    : '—'
                }
              />
              <Detail
                title="SpO₂"
                value={
                  data?.spo2 != null
                    ? `${data.spo2}%`
                    : '—'
                }
              />
              <Detail
                title="Stress"
                value={data?.stress != null ? `${data.stress}` : '—'}
              />
              <Detail
                title="Energy"
                value={data?.energy != null ? `${data.energy}` : '—'}
              />
              <Detail
                title="Mood"
                value={data?.mood != null ? `${data.mood}` : '—'}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Detail({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.detailRow}>
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
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
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
    fontSize: 30,
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
  list: {
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