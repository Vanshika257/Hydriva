import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from './src/constants/colors';
import { configureNotificationHandler, scheduleAllReminders } from './src/services/notificationService';
import { getSettings, saveSettings } from './src/services/storageService';
import HomeScreen from './src/screens/HomeScreen';
import WeeklyScreen from './src/screens/WeeklyScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

configureNotificationHandler();

// Reminders are scheduled as concrete one-shot occurrences over a rolling window (see
// notificationService.DAYS_AHEAD), so the window needs periodic refreshing to keep going.
// Re-extending it on every app launch is a natural fit since this is an app you'd open daily.
async function refreshReminderWindow() {
  try {
    const settings = await getSettings();
    const hasActiveReminders =
      settings.notificationIds?.water?.length > 0 || settings.notificationIds?.vitamin?.length > 0;
    if (!hasActiveReminders) return;

    const notificationIds = await scheduleAllReminders(settings);
    await saveSettings({ ...settings, notificationIds });
  } catch (error) {
    console.warn('[Hydriva] Failed to refresh reminder window:', error?.message);
  }
}

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Weekly: '📅',
  Stats: '🔥',
  Settings: '⚙️',
};

function TabIcon({ route, color }) {
  return <Text style={{ fontSize: 20, color }}>{TAB_ICONS[route.name]}</Text>;
}

export default function App() {
  useEffect(() => {
    refreshReminderWindow();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: '#9DB3AE',
            tabBarStyle: { backgroundColor: COLORS.white },
            tabBarIcon: ({ color }) => <TabIcon route={route} color={color} />,
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Weekly" component={WeeklyScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
