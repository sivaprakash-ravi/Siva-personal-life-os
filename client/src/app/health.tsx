import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
      .then((response) => response.json())
      .then(setData)
      .catch((error) => console.error('Health API:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Health</Text>
        <Text style={styles.subtitle}>Your health metrics in one place.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
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
    marginTop: 30,
  },
  card: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#9AA1AC',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },
});