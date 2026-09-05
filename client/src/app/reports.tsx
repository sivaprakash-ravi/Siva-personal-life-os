import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getReportSummary,
  type ReportSummary,
  type ReportType,
} from '../services/api';
import {
  computeReportRange,
  formatDateKey,
  formatReportRange,
  shiftReference,
} from '../utils/report-period';
import { downloadReportPdf } from '../utils/report-download';

const REPORT_TYPES: { key: ReportType; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}

export default function ReportsScreen() {
  const [reportType, setReportType] = useState<ReportType>('week');
  const [referenceDate, setReferenceDate] = useState(() => formatDateKey(new Date()));

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);

  const loadSummary = useCallback(
    async (renderDate = referenceDate, type = reportType) => {
      setError(false);
      setLoading(true);
      try {
        const data = await getReportSummary(type, renderDate);
        setSummary(data as ReportSummary);
      } catch (e) {
        console.error('Reports summary:', e);
        setSummary(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [referenceDate, reportType],
  );

  useEffect(() => {
    loadSummary(referenceDate, reportType);
  }, [referenceDate, reportType, loadSummary]);

  const range = computeReportRange(reportType, referenceDate);
  const rangeLabel = formatReportRange(reportType, range);

  function changeType(type: ReportType) {
    setReportType(type);
    setPdfMessage(null);
  }

  function step(delta: number) {
    setReferenceDate(shiftReference(reportType, referenceDate, delta));
    setPdfMessage(null);
  }

  function goToToday() {
    setReferenceDate(formatDateKey(new Date()));
    setPdfMessage(null);
  }

  async function handleGenerate() {
    setGenerating(true);
    setPdfMessage(null);
    try {
      await downloadReportPdf(reportType, referenceDate);
      setPdfMessage('Report generated.');
    } catch (e) {
      console.error('Reports PDF:', e);
      setPdfMessage(
        'Could not generate the report. Check the connection and try again.',
      );
    } finally {
      setGenerating(false);
    }
  }

  const aggregates =
    summary?.aggregates ?? ({} as ReportSummary['aggregates']);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>SIVA OS</Text>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>
          Server-generated PDF reports from your real recorded data.
        </Text>

        {/* Segmented control */}
        <View style={styles.segmented}>
          {REPORT_TYPES.map((type) => {
            const active = reportType === type.key;
            return (
              <Pressable
                key={type.key}
                onPress={() => changeType(type.key)}
                style={[
                  styles.segment,
                  active && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Range stepper */}
        <View style={styles.rangeCard}>
          <View style={styles.rangeTopRow}>
            <Text style={styles.cardLabel}>RANGE</Text>
            <Pressable onPress={goToToday} style={({ pressed }) => [styles.todayButton, pressed && styles.buttonPressed]}>
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>
          </View>

          <View style={styles.stepperRow}>
            <Pressable onPress={() => step(-1)} style={({ pressed }) => [styles.stepButton, pressed && styles.buttonPressed]}>
              <Text style={styles.stepGlyph}>‹</Text>
            </Pressable>

            <View style={styles.rangeCenter}>
              <Text style={styles.rangeText}>{rangeLabel}</Text>
              <Text style={styles.rangeDates}>
                {range.start} → {range.end}
              </Text>
            </View>

            <Pressable onPress={() => step(1)} style={({ pressed }) => [styles.stepButton, pressed && styles.buttonPressed]}>
              <Text style={styles.stepGlyph}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Preview / summary */}
        <Text style={styles.sectionTitle}>Report preview</Text>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>Couldn't load the report preview</Text>
            <Text style={styles.emptyText}>
              The report service is not available right now. You can still try
              generating the PDF below.
            </Text>
            <Pressable onPress={() => loadSummary()} style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Row label="Period" value={`${rangeLabel} (${summary?.days?.length ?? 0} days)`} />
            <Row label="Check-in completion" value={`${Math.round(aggregates.checkin_completion_rate ?? 0)}%`} />
            <Row label="Health score" value={`${Math.round(aggregates.health_score ?? 0)}%`} />
            <Row label="Nutrition score" value={`${Math.round(aggregates.nutrition_score ?? 0)}%`} />
            <Row label="Finance spend" value={`Rs. ${formatAmount(aggregates.finance_spend ?? 0)}`} last />
            <Text style={styles.previewNote}>
              The PDF includes the full per-day breakdown for daily, health,
              nutrition, finance and activity.
            </Text>
          </View>
        )}

        {/* Generate */}
        <Pressable
          onPress={handleGenerate}
          disabled={generating}
          style={({ pressed }) => [
            styles.generateButton,
            pressed && styles.buttonPressed,
            generating && styles.buttonDisabled,
          ]}
        >
          {generating ? (
            <ActivityIndicator color="#0B0D10" />
          ) : (
            <Text style={styles.generateButtonText}>
              Generate PDF report
            </Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          {formatDataHonesty(summary)}
        </Text>

        {pdfMessage ? (
          <Text style={styles.message}>{pdfMessage}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDataHonesty(summary: ReportSummary | null): string {
  const start = summary?.range?.start;
  if (!start) {
    return 'Reports are generated on the server from recorded data only — no fabricated numbers.';
  }
  return `Covering ${start} onwards — all figures come from your real recorded data.`;
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowTitle}>{formatLabel(label)}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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

  segmented: {
    flexDirection: 'row',
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },

  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },

  segmentActive: {
    backgroundColor: '#FFFFFF',
  },

  segmentText: {
    color: '#929AA6',
    fontSize: 13,
    fontWeight: '700',
  },

  segmentTextActive: {
    color: '#0B0D10',
  },

  rangeCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },

  rangeTopRow: {
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

  todayButton: {
    borderWidth: 1,
    borderColor: '#2A2F37',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  todayButtonText: {
    color: '#D0D4DA',
    fontSize: 12,
    fontWeight: '700',
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },

  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#2A2F37',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepGlyph: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },

  rangeCenter: {
    flex: 1,
    alignItems: 'center',
  },

  rangeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  rangeDates: {
    color: '#7F8794',
    fontSize: 12,
    marginTop: 2,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 32,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 4,
  },

  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242830',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  rowTitle: {
    color: '#929AA6',
    fontSize: 14,
  },

  rowValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  previewNote: {
    color: '#7F8794',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },

  generateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  generateButtonText: {
    color: '#0B0D10',
    fontSize: 14,
    fontWeight: '800',
  },

  hint: {
    color: '#7F8794',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  message: {
    color: '#929AA6',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  emptyText: {
    color: '#929AA6',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  retryButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  retryButtonText: {
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
});