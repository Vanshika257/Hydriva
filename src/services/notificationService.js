import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const WATER_LABELS = ['Morning', 'Afternoon', 'Evening'];

// expo-notifications' DAILY/WEEKLY trigger types have a long-standing history of being
// unreliable on Android (see github.com/expo/expo issues #10700, #10415: they can fire
// rarely/never, and adding channelId breaks them entirely). TIME_INTERVAL triggers do not
// have this problem, so recurring reminders are built by scheduling concrete one-shot
// occurrences over a rolling window instead of relying on native day/week repetition.
const DAYS_AHEAD = 14;

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Hydriva Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4A90A4',
  });
}

// Returns true if permission is granted.
export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelScheduledNotifications(identifiers) {
  const ids = [...(identifiers?.water || []), ...(identifiers?.vitamin || [])];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

function nextDailyOccurrences(hour, minute, daysAhead) {
  const now = new Date();
  const dates = [];
  for (let i = 0; i <= daysAhead; i += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate.getTime() > now.getTime()) {
      dates.push(candidate);
    }
  }
  return dates;
}

function nextWeekdayOccurrences(hour, minute, weekdays, daysAhead) {
  const now = new Date();
  const dates = [];
  for (let i = 0; i <= daysAhead; i += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate.getTime() > now.getTime() && weekdays.includes(candidate.getDay())) {
      dates.push(candidate);
    }
  }
  return dates;
}

function scheduleOneShot(date, content, channelId) {
  const seconds = Math.max(1, Math.round((date.getTime() - Date.now()) / 1000));
  return Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
      channelId,
    },
  });
}

async function scheduleWaterReminders(waterTimes) {
  const channelId = Platform.OS === 'android' ? 'reminders' : undefined;
  const ids = [];
  for (let i = 0; i < waterTimes.length; i += 1) {
    const { hour, minute } = waterTimes[i];
    const occurrences = nextDailyOccurrences(hour, minute, DAYS_AHEAD);
    for (const date of occurrences) {
      const id = await scheduleOneShot(
        date,
        {
          title: 'Time to hydrate 💧',
          body: `${WATER_LABELS[i] || 'Reminder'} water check-in`,
        },
        channelId
      );
      ids.push(id);
    }
  }
  return ids;
}

async function scheduleVitaminReminders(vitaminTime, vitaminDays) {
  if (!vitaminDays || vitaminDays.length === 0) return [];
  const channelId = Platform.OS === 'android' ? 'reminders' : undefined;
  const occurrences = nextWeekdayOccurrences(vitaminTime.hour, vitaminTime.minute, vitaminDays, DAYS_AHEAD);
  const ids = [];
  for (const date of occurrences) {
    const id = await scheduleOneShot(
      date,
      { title: 'Vitamin reminder 🌿', body: "Don't forget today's vitamin" },
      channelId
    );
    ids.push(id);
  }
  return ids;
}

// Diagnostic helper — logs what expo-notifications actually has registered with the OS.
export async function logScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`[Hydriva] ${scheduled.length} notification(s) currently scheduled:`);
  scheduled.forEach((n) => {
    console.log(`  - "${n.content.title}" trigger=${JSON.stringify(n.trigger)}`);
  });
  return scheduled;
}

// Cancels any previously scheduled reminders and schedules a fresh rolling window from settings.
// Returns the new { water: [...ids], vitamin: [...ids] } to persist in settings.
export async function scheduleAllReminders(settings) {
  const granted = await requestNotificationPermission();
  if (!granted) {
    throw new Error('Notification permission was not granted.');
  }

  await ensureAndroidChannel();
  await cancelScheduledNotifications(settings.notificationIds);

  const waterIds = await scheduleWaterReminders(settings.waterTimes);
  const vitaminIds = await scheduleVitaminReminders(settings.vitaminTime, settings.vitaminDays);

  return { water: waterIds, vitamin: vitaminIds };
}
