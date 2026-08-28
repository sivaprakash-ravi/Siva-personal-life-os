import { Link, Slot, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const tabs = [
  { label: 'Today', path: '/' },
  { label: 'Health', path: '/health' },
  { label: 'Nutrition', path: '/nutrition' },
  { label: 'Finance', path: '/finance' },
];

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const active =
            tab.path === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.path);

          return (
            <Link key={tab.path} href={tab.path} asChild>
              <View
                style={StyleSheet.flatten([
                  styles.tab,
                  active ? styles.activeTab : null,
                ])}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.label,
                    active ? styles.activeLabel : null,
                  ])}
                >
                  {tab.label}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#0B0D10',
  },

  content: {
    flex: 1,
    paddingBottom: 64,
  },

  navigation: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#15181D',
    borderTopWidth: 1,
    borderTopColor: '#242830',
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  tab: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  activeTab: {
    backgroundColor: '#242830',
  },

  label: {
    color: '#7F8794',
    fontSize: 14,
    fontWeight: '600',
  },

  activeLabel: {
    color: '#FFFFFF',
  },
});