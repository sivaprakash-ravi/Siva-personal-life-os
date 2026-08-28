import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_BASE_URL = 'http://127.0.0.1:8000';

type DailyData = {
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
  const [daily, setDaily] = useState<DailyData | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadToday = useCallback(async () => {
    try {
      setError(false);

      const [dailyResponse, checkinsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/daily`),
        fetch(`${API_BASE_URL}/api/v1/daily/checkins`),
      ]);

      if (!dailyResponse.ok || !checkinsResponse.ok) {
        throw new Error('Failed to load daily data');
      }

      const dailyData: DailyData = await dailyResponse.json();
      const checkinsData: CheckIn[] = await checkinsResponse.json();

      setDaily(dailyData);
      setCheckins(checkinsData);
    } catch (err) {
      console.error('Today API:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const onRefresh = () => {
    setRefreshing(true);
    loadToday();
  };

  const toggleCheckIn = async (checkin: CheckIn) => {
    try {
      const action =
        checkin.status === 'completed'
          ? 'undo'
          : 'complete';

      const response = await fetch(
        `${API_BASE_URL}/api/v1/daily/checkins/${checkin.id}/${action}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} check-in`);
      }

      await loadToday();
    } catch (err) {
      console.error('Toggle check-in:', err);
    }
  };

  const completionRate = daily?.completion_rate ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PERSONAL LIFE OS</Text>
          <Text style={styles.title}>Siva OS</Text>
          <Text style={styles.subtitle}>
            Your life, in one place.
          </Text>
        </View>

        <View style={styles.status}>
          <View
            style={[
              styles.statusDot,
              error
                ? styles.statusOffline
                : styles.statusOnline,
            ]}
          />
          <Text style={styles.statusText}>
            {error ? 'OFFLINE' : 'ONLINE'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today</Text>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.cardLabel}>
                  DAILY COMPLETION
                </Text>

                <Text style={styles.bigNumber}>
                  {completionRate.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>DATE</Text>

                <Text style={styles.dateValue}>
                  {daily?.date ?? '—'}
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      completionRate,
                      100,
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              label="Completed"
              value={daily?.completed ?? 0}
            />

            <StatCard
              label="Pending"
              value={daily?.pending ?? 0}
            />

            <StatCard
              label="Missed"
              value={daily?.missed ?? 0}
            />

            <StatCard
              label="Total"
              value={daily?.total ?? 0}
            />
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                Backend unavailable
              </Text>

              <Text style={styles.errorText}>
                Make sure FastAPI is running on port 8000.
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={loadToday}
              >
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Today's Check-ins
              </Text>

              <Text style={styles.countText}>
                {checkins.length}
              </Text>
            </View>

            {checkins.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No check-ins for today
                </Text>

                <Text style={styles.emptyText}>
                  Your daily schedule has no check-ins yet.
                </Text>
              </View>
            ) : (
              checkins.map((checkin) => (
                <CheckInRow
                  key={checkin.id}
                  checkin={checkin}
                  onToggle={toggleCheckIn}
                />
              ))
            )}
          </View>

          <View style={styles.focusCard}>
            <Text style={styles.cardLabel}>
              TODAY'S FOCUS
            </Text>

            <Text style={styles.focusTitle}>
              Build the day.
            </Text>

            <Text style={styles.focusText}>
              Complete your scheduled check-ins and Siva OS
              will automatically update your daily progress.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function CheckInRow({
  checkin,
  onToggle,
}: {
  checkin: CheckIn;
  onToggle: (checkin: CheckIn) => void;
}) {
  const completed = checkin.status === 'completed';
  const missed = checkin.status === 'missed';

  return (
    <View style={styles.checkinRow}>
      <Pressable
        style={[
          styles.checkCircle,
          completed && styles.checkCircleCompleted,
          missed && styles.checkCircleMissed,
        ]}
        onPress={() => onToggle(checkin)}
      >
        <Text style={styles.checkIcon}>
          {completed ? '✓' : ''}
        </Text>
      </Pressable>

      <View style={styles.checkinInfo}>
        <Text
          style={[
            styles.checkinTitle,
            completed && styles.completedText,
          ]}
        >
          {formatCheckInType(checkin.type)}
        </Text>

        <Text style={styles.checkinTime}>
          Scheduled {checkin.scheduled_time}
        </Text>
      </View>

      <Text
        style={[
          styles.checkinStatus,
          completed && styles.completedStatus,
          missed && styles.missedStatus,
        ]}
      >
        {checkin.status}
      </Text>
    </View>
  );
}

function formatCheckInType(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 42,
  },

  eyebrow: {
    color: '#7F8794',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 8,
  },

  subtitle: {
    color: '#929AA6',
    fontSize: 16,
    marginTop: 6,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15181D',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  statusOnline: {
    backgroundColor: '#35D07F',
  },

  statusOffline: {
    backgroundColor: '#E35D6A',
  },

  statusText: {
    color: '#9AA1AC',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },

  loadingCard: {
    height: 160,
    borderRadius: 18,
    backgroundColor: '#15181D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
    marginBottom: 12,
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardLabel: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  bigNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 6,
  },

  dateBox: {
    alignItems: 'flex-end',
  },

  dateLabel: {
    color: '#7F8794',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  dateValue: {
    color: '#B4BBC5',
    fontSize: 13,
    marginTop: 6,
  },

  progressTrack: {
    height: 6,
    backgroundColor: '#242830',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 18,
  },

  statLabel: {
    color: '#7F8794',
    fontSize: 13,
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },

  errorCard: {
    backgroundColor: '#29191C',
    borderWidth: 1,
    borderColor: '#5C292F',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  errorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  errorText: {
    color: '#B98B91',
    fontSize: 13,
    marginTop: 5,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },

  retryText: {
    color: '#0B0D10',
    fontWeight: '700',
  },

  habitsSection: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countText: {
    color: '#7F8794',
    fontSize: 13,
    marginBottom: 14,
  },

  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#5E6672',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkCircleCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  checkCircleMissed: {
    borderColor: '#E35D6A',
  },

  checkIcon: {
    color: '#0B0D10',
    fontSize: 15,
    fontWeight: '800',
  },

  checkinInfo: {
    flex: 1,
    marginLeft: 14,
  },

  checkinTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#7F8794',
  },

  checkinTime: {
    color: '#69717D',
    fontSize: 12,
    marginTop: 4,
  },

  checkinStatus: {
    color: '#9AA1AC',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  completedStatus: {
    color: '#35D07F',
  },

  missedStatus: {
    color: '#E35D6A',
  },

  emptyCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  emptyText: {
    color: '#7F8794',
    fontSize: 14,
    marginTop: 7,
  },

  focusCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 22,
  },

  focusTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },

  focusText: {
    color: '#929AA6',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});