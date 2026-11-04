import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderSettings } from './store';

export const remindersSupported = Platform.OS !== 'web';

const CHANNEL_ID = 'psr-reminders';
// iOS keeps at most 64 pending local notifications per app.
const MAX_SCHEDULED = 60;

export function configureNotificationHandler() {
  if (!remindersSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'PSR reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

type Planned = { hour: number; minute: number; title: string; body: string; url: string };

const toHourMinute = (minutesOfDay: number) => {
  const t = Math.min(minutesOfDay, 23 * 60 + 59);
  return { hour: Math.floor(t / 60), minute: t % 60 };
};

export function planReminders(r: ReminderSettings): Planned[] {
  const planned: Planned[] = [];
  const start = r.startHour * 60;
  const end = Math.max(r.endHour * 60, start);

  if (r.clenchCheckIns && r.intervalMinutes > 0) {
    for (let t = start; t <= end; t += r.intervalMinutes) {
      planned.push({
        ...toHourMinute(t),
        title: 'Jaw check-in',
        body: 'Are your teeth touching? Lips together, teeth apart, tongue resting.',
        url: '/checkin',
      });
    }
  }

  if (r.exerciseReminders) {
    const span = end - start;
    for (let i = 0; i < 5; i++) {
      const t = start + Math.round((span * i) / 4);
      planned.push({
        ...toHourMinute(t + 5),
        title: `Stretch practice ${i + 1} of 5`,
        body: 'Time for your jaw, neck, and upper back stretches.',
        url: '/',
      });
    }
  }

  if (r.breathingReminders) {
    const morning = Math.min(start + 60, end);
    const evening = Math.max(end - 60, start);
    for (const [i, t] of [morning, evening].entries()) {
      planned.push({
        ...toHourMinute(t + 10),
        title: `Breathing session ${i + 1} of 2`,
        body: '15 minutes of diaphragmatic breathing.',
        url: '/breathing',
      });
    }
  }

  return planned.slice(0, MAX_SCHEDULED);
}

export async function cancelAllReminders() {
  if (remindersSupported) await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function applyReminders(r: ReminderSettings): Promise<{ ok: boolean; count: number; message?: string }> {
  if (!remindersSupported) {
    return { ok: false, count: 0, message: 'Reminders are available in the Android and iOS apps.' };
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  const planned = planReminders(r);
  if (planned.length === 0) return { ok: true, count: 0 };

  const granted = await ensurePermission();
  if (!granted) {
    return { ok: false, count: 0, message: 'Notification permission was denied. Enable it in system settings.' };
  }

  for (const p of planned) {
    await Notifications.scheduleNotificationAsync({
      content: { title: p.title, body: p.body, data: { url: p.url } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: p.hour,
        minute: p.minute,
        channelId: CHANNEL_ID,
      },
    });
  }
  return { ok: true, count: planned.length };
}
