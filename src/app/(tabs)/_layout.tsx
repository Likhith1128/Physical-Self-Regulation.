import { Ionicons } from '@expo/vector-icons';
import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import { colors, IconName } from '@/components/ui';

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('today-outline') }} />
      <Tabs.Screen name="session1" options={{ title: 'Session 1', tabBarIcon: icon('body-outline') }} />
      <Tabs.Screen name="session2" options={{ title: 'Session 2', tabBarIcon: icon('leaf-outline') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: icon('stats-chart-outline') }} />
    </Tabs>
  );
}
