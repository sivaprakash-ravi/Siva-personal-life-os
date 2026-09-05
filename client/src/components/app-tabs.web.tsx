import { Link, Slot, usePathname } from 'expo-router';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { LogoMark } from '@/components/brand/logo-mark';
import { BRAND } from '@/constants/brand';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

const tabs = [
  { label: 'Today', path: '/', glyph: '⚡' },
  { label: 'Health', path: '/health', glyph: '💚' },
  { label: 'Nutrition', path: '/nutrition', glyph: '🔥' },
  { label: 'Finance', path: '/finance', glyph: '₹' },
  { label: 'Reports', path: '/reports', glyph: '📄' },
] as const;

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      {/* Compact premium left sidebar (desktop web) */}
      <aside style={styles.sidebar} className="siva-nav siva-sidebar">
        <View style={styles.brand}>
          <LogoMark size={34} />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>{BRAND.name}</Text>
            <Text style={styles.brandTagline}>{BRAND.tagline}</Text>
          </View>
        </View>

        <nav style={styles.nav}>
          {tabs.map((tab) => {
            const active =
              tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);

            return (
              <Link
                key={tab.path}
                href={tab.path}
                className="siva-nav-item"
                style={[styles.item, active && styles.itemActive]}
              >
                <View style={[styles.itemMarker, active && styles.itemMarkerActive]} />
                <Text
                  style={[styles.itemLabel, active && styles.itemLabelActive]}
                >
                  {tab.label}
                </Text>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom navigation (mobile web, <= 767px via global.css) */}
      <nav className="siva-mobile-nav" style={styles.mobileNav}>
        {tabs.map((tab) => {
          const active =
            tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="siva-nav-item"
              style={[styles.mobileItem, active && styles.itemActive]}
            >
              <Text style={[styles.mobileGlyph, active && styles.mobileGlyphActive]}>
                {tab.glyph}
              </Text>
              <Text style={[styles.mobileLabel, active && styles.itemLabelActive]}>
                {tab.label}
              </Text>
            </Link>
          );
        })}
      </nav>

      {/* Main dashboard */}
      <View style={styles.content} className="siva-content">
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as DimensionValue,
    backgroundColor: '#0A0C0E',
  },
  sidebar: {
    width: 232,
    flexShrink: 0,
    backgroundColor: '#0D1015',
    borderRightWidth: 1,
    borderRightColor: '#1B202B',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    display: 'flex',
    flexDirection: 'column',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.five,
  },
  brandText: {
    flexShrink: 1,
    minWidth: 0,
  },
  brandName: {
    color: '#F5F7FA',
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.4,
  },
  brandTagline: {
    color: '#6B7480',
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.one,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
  },
  itemActive: {
    backgroundColor: 'rgba(91, 140, 255, 0.14)',
    shadowColor: '#5B8CFF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  mobileNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mobileItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: Radius.md,
  },
  mobileGlyph: {
    fontSize: FontSize.title - 4,
    color: '#7F8794',
    opacity: 0.7,
  },
  mobileGlyphActive: {
    color: '#5B8CFF',
    opacity: 1,
  },
  mobileLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: '#7F8794',
  },
  itemMarker: {
    width: 3,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: 'transparent',
  },
  itemMarkerActive: {
    backgroundColor: '#5B8CFF',
  },
  itemLabel: {
    color: '#7F8794',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  itemLabelActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
