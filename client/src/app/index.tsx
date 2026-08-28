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

const API_BASE_URL = 'http://127.0.0.1:8000';

type DailySummary = {
  date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
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

export default function TodayScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadToday = useCallback(async () => {
    try {
      const [summaryResponse, checkinsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/daily`),
        fetch(`${API_BASE_URL}/api/v1/daily/checkins`),
      ]);

      if (!summaryResponse.ok || !checkinsResponse.ok) {
        throw new Error('Failed to load today data');
      }

      const summaryData = await summaryResponse.json();
      const checkinsData = await checkinsResponse.json();

      setSummary(summaryData);

      const normalizedCheckins = Array.isArray(checkinsData)
        ? checkinsData
        : checkinsData.value ?? [];

      setCheckins(normalizedCheckins);
    } catch (error) {
      console.error('Today API:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const toggleCheckin = async (checkin: CheckIn) => {
    try {
      setUpdatingId(checkin.id);

      const endpoint =
        checkin.status === 'completed'
          ? `${API_BASE_URL}/api/v1/daily/checkins/${checkin.id}/undo`
          : `${API_BASE_URL}/api/v1/daily/checkins/${checkin.id}/complete`;

      const response = await fetch(endpoint, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update check-in');
      }

      await loadToday();
    } catch (error) {
      console.error('Check-in update:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const completionRate = summary?.completion_rate ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BRANDING */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PERSONAL LIFE OS</Text>
            <Text style={styles.logo}>Siva OS</Text>
            <Text style={styles.tagline}>Your life, in one place.</Text>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        {/* TODAY */}
        <Text style={styles.sectionTitle}>Today</Text>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            {/* COMPLETION CARD */}
            <View style={styles.completionCard}>
              <View style={styles.completionHeader}>
                <Text style={styles.cardEyebrow}>DAILY COMPLETION</Text>

                <Text style={styles.dateText}>
                  {summary?.date ?? ''}
                </Text>
              </View>

              <Text style={styles.completionValue}>
                {Math.round(completionRate)}%
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        Math.max(completionRate, 0),
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* SUMMARY CARDS */}
            <View style={styles.summaryGrid}>
              <SummaryCard
                title="Completed"
                value={summary?.completed ?? 0}
              />

              <SummaryCard
                title="Pending"
                value={summary?.pending ?? 0}
              />

              <SummaryCard
                title="Missed"
                value={summary?.missed ?? 0}
              />

              <SummaryCard
                title="Total"
                value={summary?.total ?? 0}
              />
            </View>

            {/* TODAY'S FOCUS */}
            <View style={styles.focusCard}>
              <Text style={styles.cardEyebrow}>TODAY'S FOCUS</Text>

              <Text style={styles.focusTitle}>
                {summary?.total
                  ? 'Keep moving.'
                  : 'Build the day.'}
              </Text>

              <Text style={styles.focusText}>
                Complete your planned check-ins and let Siva OS
                track the progress.
              </Text>
            </View>

            {/* CHECK-INS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Check-ins</Text>

              <Text style={styles.countText}>
                {checkins.length} today
              </Text>
            </View>

            {checkins.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No check-ins for today
                </Text>

                <Text style={styles.emptyText}>
                  Your daily schedule is ready to be connected.
                </Text>
              </View>
            ) : (
              checkins.map((checkin) => (
                <CheckInCard
                  key={checkin.id}
                  checkin={checkin}
                  updating={updatingId === checkin.id}
                  onPress={() => toggleCheckin(checkin)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function CheckInCard({
  checkin,
  updating,
  onPress,
}: {
  checkin: CheckIn;
  updating: boolean;
  onPress: () => void;
}) {
  const completed = checkin.status === 'completed';
  const missed = checkin.status === 'missed';

  const displayType =
    checkin.type.charAt(0).toUpperCase() +
    checkin.type.slice(1);

  return (
    <View
      style={[
        styles.checkinCard,
        completed && styles.checkinCompleted,
      ]}
    >
      <View style={styles.checkinInfo}>
        <Text
          style={[
            styles.checkinTitle,
            completed && styles.completedText,
          ]}
        >
          {displayType}
        </Text>

        <Text style={styles.checkinTime}>
          Scheduled {checkin.scheduled_time}
        </Text>

        {missed && (
          <Text style={styles.missedText}>Missed</Text>
        )}
      </View>

      <Pressable
        onPress={onPress}
        disabled={updating || missed}
        style={({ pressed }) => [
          styles.actionButton,
          completed && styles.undoButton,
          pressed && styles.buttonPressed,
          (updating || missed) && styles.buttonDisabled,
        ]}
      >
        {updating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.actionButtonText}>
            {completed ? 'Undo' : 'Complete'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 34,
  },

  eyebrow: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 7,
  },

  tagline: {
    color: '#929AA6',
    fontSize: 15,
    marginTop: 5,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15181D',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#35D07F',
    marginRight: 7,
  },

  onlineText: {
    color: '#AEB6C2',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },

  loader: {
    marginTop: 40,
  },

  completionCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  },

  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardEyebrow: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  dateText: {
    color: '#929AA6',
    fontSize: 12,
  },

  completionValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 14,
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#242830',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 18,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 15,
  },

  summaryTitle: {
    color: '#929AA6',
    fontSize: 12,
    fontWeight: '600',
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 9,
  },

  focusCard: {
    backgroundColor: '#181B21',
    borderWidth: 1,
    borderColor: '#292E37',
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
  },

  focusTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 12,
  },

  focusText: {
    color: '#929AA6',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countText: {
    color: '#7F8794',
    fontSize: 12,
    marginBottom: 14,
  },

  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 17,
    marginBottom: 10,
  },

  checkinCompleted: {
    borderColor: '#3A414C',
    opacity: 0.75,
  },

  checkinInfo: {
    flex: 1,
    marginRight: 14,
  },

  checkinTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#929AA6',
  },

  checkinTime: {
    color: '#7F8794',
    fontSize: 12,
    marginTop: 5,
  },

  missedText: {
    color: '#D47777',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  actionButton: {
    minWidth: 80,
    height: 38,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  undoButton: {
    borderColor: '#7F8794',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.65,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  emptyCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 22,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  emptyText: {
    color: '#7F8794',
    fontSize: 13,
    marginTop: 7,
  },
});