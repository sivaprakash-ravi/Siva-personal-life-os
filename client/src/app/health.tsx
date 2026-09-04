import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getHealth,
  getTodayHealthRecords,
  createHealthRecord,
  deleteHealthRecord,
} from '../services/api';

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

type HealthRecord = {
  id: number;
  date: string;
  metric_type: string;
  value: number | null;
  unit: string | null;
  source: string;
  notes: string | null;
};

const METRICS = [
  { key: 'steps', label: 'Steps', unit: 'steps' },
  { key: 'water', label: 'Water', unit: 'ml' },
  { key: 'sleep_hours', label: 'Sleep', unit: 'hours' },
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'exercise_minutes', label: 'Exercise', unit: 'min' },
  { key: 'distance', label: 'Distance', unit: 'km' },
  { key: 'active_calories', label: 'Active Calories', unit: 'kcal' },
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
  {
    key: 'resting_heart_rate',
    label: 'Resting Heart Rate',
    unit: 'bpm',
  },
  { key: 'spo2', label: 'SpO₂', unit: '%' },
  { key: 'stress', label: 'Stress', unit: '' },
  { key: 'energy', label: 'Energy', unit: '' },
  { key: 'mood', label: 'Mood', unit: '' },
];

export default function HealthScreen() {
  const [data, setData] = useState<HealthData | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [selectedMetric, setSelectedMetric] = useState('steps');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const loadHealth = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(false);
    try {
      const [summary, todayRecords] = await Promise.all([
        getHealth(),
        getTodayHealthRecords(),
      ]);

      setData(summary as HealthData);
      setRecords(todayRecords as HealthRecord[]);
    } catch (error) {
      console.error('Health API:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const initialFocusDone = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const first = !initialFocusDone.current;
      initialFocusDone.current = true;
      loadHealth(first);
    }, [loadHealth]),
  );

  async function addRecord() {
    if (!value.trim()) {
      setMessage('Enter a value first.');
      return;
    }

    const metric = METRICS.find(
      (item) => item.key === selectedMetric,
    );

    if (!metric) {
      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      setMessage('Value must be a number.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await createHealthRecord({
        metric_type: selectedMetric,
        value: numericValue,
        unit: metric.unit || null,
        source: 'manual',
        notes: notes.trim() || null,
      });

      setValue('');
      setNotes('');
      setMessage('Health record saved.');

      await loadHealth(true);
    } catch (error) {
      console.error('Health record:', error);
      setMessage('Could not save the health record.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(recordId: number) {
    try {
      await deleteHealthRecord(recordId);
      await loadHealth(true);
    } catch (error) {
      console.error('Delete health record:', error);
    }
  }

  const selectedMetricData =
    METRICS.find(
      (item) => item.key === selectedMetric,
    ) ?? METRICS[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>SIVA OS</Text>

        <Text style={styles.title}>
          Health
        </Text>

        <Text style={styles.subtitle}>
          Your health metrics in one place.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Couldn't load health data</Text>
            <Text style={styles.errorMessage}>
              Check your connection and try again.
            </Text>
            <Pressable
              onPress={() => loadHealth(true)}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.cardTitle}>
                  TODAY
                </Text>

                <Text style={styles.date}>
                  {data?.date ?? '—'}
                </Text>
              </View>

              <Text style={styles.status}>
                LIVE
              </Text>
            </View>

            <View style={styles.grid}>
              <Metric
                title="Steps"
                value={`${data?.steps ?? 0}`}
              />

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

            <Text style={styles.sectionTitle}>
              Add Health Data
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                METRIC
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.metricSelector}
              >
                {METRICS.map((metric) => (
                  <Pressable
                    key={metric.key}
                    onPress={() => {
                      setSelectedMetric(metric.key);
                      setMessage('');
                    }}
                    style={[
                      styles.metricOption,
                      selectedMetric === metric.key &&
                        styles.metricOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricOptionText,
                        selectedMetric === metric.key &&
                          styles.metricOptionTextSelected,
                      ]}
                    >
                      {metric.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.selectedMetric}>
                {selectedMetricData.label}
                {selectedMetricData.unit
                  ? ` (${selectedMetricData.unit})`
                  : ''}
              </Text>

              <Text style={styles.inputLabel}>
                VALUE
              </Text>

              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder="Enter value"
                placeholderTextColor="#5F6672"
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                NOTES
              </Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes"
                placeholderTextColor="#5F6672"
                multiline
                style={[
                  styles.input,
                  styles.notesInput,
                ]}
              />

              <Pressable
                onPress={addRecord}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                  saving && styles.buttonDisabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#0B0D10" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Save Health Record
                  </Text>
                )}
              </Pressable>

              {message ? (
                <Text style={styles.message}>
                  {message}
                </Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>
              Body & Vitals
            </Text>

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
                value={
                  data?.stress != null
                    ? `${data.stress}`
                    : '—'
                }
              />

              <Detail
                title="Energy"
                value={
                  data?.energy != null
                    ? `${data.energy}`
                    : '—'
                }
              />

              <Detail
                title="Mood"
                value={
                  data?.mood != null
                    ? `${data.mood}`
                    : '—'
                }
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Today's Records
            </Text>

            <View style={styles.list}>
              {records.length === 0 ? (
                <Text style={styles.emptyText}>
                  No health records added today.
                </Text>
              ) : (
                records.map((record, index) => (
                  <View
                    key={record.id}
                    style={[
                      styles.recordRow,
                      index === records.length - 1 &&
                        styles.recordRowLast,
                    ]}
                  >
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>
                        {formatMetricName(
                          record.metric_type,
                        )}
                      </Text>

                      <Text style={styles.recordMeta}>
                        {record.source}
                        {record.notes
                          ? ` • ${record.notes}`
                          : ''}
                      </Text>
                    </View>

                    <View style={styles.recordRight}>
                      <Text style={styles.recordValue}>
                        {record.value ?? '—'}
                        {record.unit
                          ? ` ${record.unit}`
                          : ''}
                      </Text>

                      <Pressable
                        onPress={() =>
                          deleteRecord(record.id)
                        }
                      >
                        <Text style={styles.deleteText}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMetricName(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
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
      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>
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
      <Text style={styles.detailTitle}>
        {title}
      </Text>

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

  formCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },

  inputLabel: {
    color: '#7F8794',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  metricSelector: {
    gap: 8,
    paddingBottom: 4,
  },

  metricOption: {
    borderWidth: 1,
    borderColor: '#2A2F37',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  metricOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  metricOptionText: {
    color: '#929AA6',
    fontSize: 12,
    fontWeight: '600',
  },

  metricOptionTextSelected: {
    color: '#0B0D10',
  },

  selectedMetric: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 18,
  },

  input: {
    backgroundColor: '#0B0D10',
    borderWidth: 1,
    borderColor: '#292E37',
    borderRadius: 11,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  saveButtonText: {
    color: '#0B0D10',
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  message: {
    color: '#929AA6',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
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

  recordRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242830',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recordRowLast: {
    borderBottomWidth: 0,
  },

  recordInfo: {
    flex: 1,
    marginRight: 12,
  },

  recordTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  recordMeta: {
    color: '#7F8794',
    fontSize: 11,
    marginTop: 5,
  },

  recordRight: {
    alignItems: 'flex-end',
  },

  recordValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  deleteText: {
    color: '#8E959F',
    fontSize: 11,
    marginTop: 5,
  },

  emptyText: {
    color: '#7F8794',
    padding: 20,
    fontSize: 14,
  },

  errorCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#3A2430',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },

  errorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorMessage: {
    color: '#929AA6',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryButtonText: {
    color: '#0B0D10',
    fontSize: 13,
    fontWeight: '800',
  },
});