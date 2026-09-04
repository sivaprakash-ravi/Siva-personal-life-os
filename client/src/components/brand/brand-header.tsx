import { StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/brand/logo-mark';
import { StatusBadge } from '@/components/ui/dashboard/status-badge';
import type { StatusTone } from '@/components/ui/dashboard/types';
import { ThemedText } from '@/components/themed-text';
import { BRAND } from '@/constants/brand';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BrandHeaderProps = {
  connected: boolean;
  /** Show the tagline under the wordmark (wide screens). */
  showTagline?: boolean;
};

/**
 * Slim SIVA OS identity strip shown at the top of the Home dashboard. Renders
 * the logo mark, the SIVA OS wordmark and (optionally) the tagline, together
 * with a connection indicator. Compact so it never consumes excessive
 * vertical space on mobile.
 */
export function BrandHeader({ connected, showTagline = false }: BrandHeaderProps) {
  const theme = useTheme();
  const tone: StatusTone = connected ? 'success' : 'danger';

  return (
    <View style={styles.row}>
      <View style={styles.branding}>
        <LogoMark size={38} />
        <View style={styles.wordmark}>
          <ThemedText style={styles.name}>{BRAND.name}</ThemedText>
          {showTagline ? (
            <ThemedText style={styles.tagline} themeColor="textMuted">
              {BRAND.tagline}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <StatusBadge
        label={connected ? 'Connected' : 'Offline'}
        tone={tone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flexShrink: 1,
  },
  wordmark: {
    flexShrink: 1,
    minWidth: 0,
  },
  name: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.half,
  },
});
