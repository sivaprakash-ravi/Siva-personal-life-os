import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { FontSize, FontWeight, Radius } from '@/constants/theme';

function TabGlyph({ glyph, color, focused }: { glyph: string; color: ColorValue; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: FontSize.title - 2,
        color: color as ColorValue,
        opacity: focused ? 1 : 0.7,
      }}
    >
      {glyph}
    </Text>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5B8CFF',
        tabBarInactiveTintColor: '#7F8794',
        tabBarStyle: {
          backgroundColor: '#12151A',
          borderTopColor: '#1B202B',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.caption,
          fontWeight: FontWeight.semibold,
        },
        tabBarItemStyle: {
          borderRadius: Radius.md,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph glyph="⚡" color={color} focused={focused ?? false} />
          ),
        }}
      />

      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph glyph="💚" color={color} focused={focused ?? false} />
          ),
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph glyph="🔥" color={color} focused={focused ?? false} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph glyph="₹" color={color} focused={focused ?? false} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="unified"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
