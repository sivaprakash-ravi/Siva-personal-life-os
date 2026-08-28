import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
      .then((response) => response.json())
      .then(setData)
      .catch((error) => console.error('Nutrition API:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Meals, calories and protein.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <Metric title="Calories" value={`${data?.calories ?? 0} kcal`} />
            <Metric
              title="Protein"
              value={`${data?.protein_grams ?? 0} g`}
            />
            <Metric
              title="Meals"
              value={`${data?.meals_completed ?? 0}/${data?.meals_expected ?? 0}`}
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