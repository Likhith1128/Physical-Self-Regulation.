import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { configureNotificationHandler, remindersSupported } from '@/lib/notifications';
import { StoreProvider } from '@/lib/store';

configureNotificationHandler();

function useNotificationNavigation(enabled: boolean) {
  useEffect(() => {
    if (!remindersSupported || !enabled) return;
    const open = (n: Notifications.Notification) => {
      const url = n.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    };
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last.notification);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => sub.remove();
  }, [enabled]);
}

function RootNavigator() {
  const { ready, user } = useAuth();
  const signedIn = !!user;
  useNotificationNavigation(signedIn);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <StoreProvider key={user?.email ?? 'signed-out'} userId={user?.email ?? null}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="exercise/[id]" options={{ title: 'Stretch' }} />
          <Stack.Screen name="breathing" options={{ title: 'Diaphragmatic Breathing' }} />
          <Stack.Screen name="checkin" options={{ title: 'Jaw Check-in', presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="auth" options={{ headerShown: false, title: 'Sign in' }} />
        </Stack.Protected>
      </Stack>
    </StoreProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
