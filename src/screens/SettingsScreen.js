import { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import TimeStepper from '../components/TimeStepper';
import WeekdayPicker from '../components/WeekdayPicker';
import { COLORS } from '../constants/colors';
import { DEFAULT_SETTINGS } from '../constants/storage';
import { logScheduledNotifications, scheduleAllReminders } from '../services/notificationService';
import { getSettings, saveSettings } from '../services/storageService';

const WATER_TIME_LABELS = ['Morning water reminder', 'Afternoon water reminder', 'Evening water reminder'];

export default function SettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const loaded = await getSettings();
    setSettings(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateWaterTime = (index, newValue) => {
    const waterTimes = [...settings.waterTimes];
    waterTimes[index] = newValue;
    setSettings({ ...settings, waterTimes });
  };

  const toggleVitaminDay = (dayIndex) => {
    const isSelected = settings.vitaminDays.includes(dayIndex);
    const vitaminDays = isSelected
      ? settings.vitaminDays.filter((d) => d !== dayIndex)
      : [...settings.vitaminDays, dayIndex].sort();
    setSettings({ ...settings, vitaminDays });
  };

  const handleSaveAndSchedule = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      const notificationIds = await scheduleAllReminders(settings);
      const updated = { ...settings, notificationIds };
      await saveSettings(updated);
      setSettings(updated);
      await logScheduledNotifications();
      Alert.alert('Reminders scheduled', 'Your water and vitamin reminders are set.');
    } catch (error) {
      Alert.alert('Could not schedule reminders', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Settings</Text>

        <Text style={styles.sectionTitle}>Water Reminders</Text>
        {settings.waterTimes.map((time, index) => (
          <TimeStepper
            key={WATER_TIME_LABELS[index]}
            label={WATER_TIME_LABELS[index]}
            value={time}
            onChange={(newValue) => updateWaterTime(index, newValue)}
          />
        ))}

        <Text style={styles.sectionTitle}>Vitamin Reminder</Text>
        <TimeStepper
          label="Vitamin reminder time"
          value={settings.vitaminTime}
          onChange={(newValue) => setSettings({ ...settings, vitaminTime: newValue })}
        />

        <Text style={styles.subLabel}>Days of the week</Text>
        <WeekdayPicker selectedDays={settings.vitaminDays} onToggleDay={toggleVitaminDay} />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveAndSchedule}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Scheduling…' : 'Save & Schedule Reminders'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
