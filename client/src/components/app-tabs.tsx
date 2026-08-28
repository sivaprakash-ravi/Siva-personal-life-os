import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#7F8794',
        tabBarStyle: {
          backgroundColor: '#15181D',
          borderTopColor: '#242830',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
        }}
      />

      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}