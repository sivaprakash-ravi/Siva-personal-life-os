import { StyleSheet, View } from 'react-native';

import { StatusTone } from '@/components/ui/dashboard/types';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DashboardHeaderProps = {
  /** ISO date string from the daily API (YYYY-MM-DD). */
  date?: string;
  name?: string;
  /** When true, the connection badge shows as connected. */
  connected: boolean;
};

function formatDateHeader(isoDate?: string): { weekday: string; date: string } {
  if (!isoDate) {
    return { weekday: '', date: '' };
  }
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { weekday: '', date: isoDate };
  }
  const weekday = parsed.toLocaleDateString(undefined, { weekday: 'long' });
  const date = parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
  });
  return { weekday, date };
}

/**
 * Top-level SIVA OS header: branding, current date context and a connection
 * status indicator alongside a compact action area.
 */
export function DashboardHeader({ date, name = 'Siva', connected }: DashboardHeaderProps) {
  const theme = useTheme();
  const { weekday, date: dateText } = formatDateHeader(date);

  const connectionTone: StatusTone = connected ? 'success' : 'danger';

  return (
    <View style={styles.container}>
      <View style={styles.branding}>
        <View style={[styles.mark, { backgroundColor: theme.accent }]}>
          <View style={styles.markCore} />
        </View>
        <View>
          <ThemedText style={styles.eyebrow} themeColor="textMuted">
            PERSONAL OPERATING SYSTEM
          </ThemedText>
          <ThemedText style={styles.logo}>SIVA OS</ThemedText>
          <ThemedText style={styles.greeting} themeColor="textSecondary">
            {weekday ? `${weekday}, ${dateText}` : `Welcome back, ${name}`}
          </ThemedText>
        </View>
      </View>

      <View style={styles.actions}>
        <StatusBadge
          label={connected ? 'Connected' : 'Offline'}
          tone={connectionTone}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flexShrink: 1,
  },
  mark: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCore: {
    width: 14,
    height: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  eyebrow: {
    fontSize: FontSize.tiny,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  logo: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: Spacing.half,
  },
  greeting: {
    fontSize: FontSize.small,
    marginTop: Spacing.one + Spacing.half,
  },
  actions: {
    marginTop: Spacing.two,
  },
});
