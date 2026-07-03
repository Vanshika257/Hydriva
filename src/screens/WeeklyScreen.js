import { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import { WATER_GOAL } from '../constants/storage';
import { getAllRecords, getSettings } from '../services/storageService';
import { formatDayLabel, getLastNDateKeys, getWeekdayFromKey } from '../utils/dateUtils';

export default function WeeklyScreen() {
  const [days, setDays] = useState([]);

  const load = useCallback(async () => {
    const [records, settings] = await Promise.all([getAllRecords(), getSettings()]);
    const dateKeys = getLastNDateKeys(7).reverse(); // most recent first

    const rows = dateKeys.map((dateKey) => {
      const record = records[dateKey] || { water: [false, false, false], vitamin: false };
      const isVitaminDay = settings.vitaminDays.includes(getWeekdayFromKey(dateKey));
      return {
        dateKey,
        waterCount: record.water.filter(Boolean).length,
        vitaminTaken: record.vitamin,
        isVitaminDay,
      };
    });
    setDays(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = ({ item }) => {
    const waterComplete = item.waterCount >= WATER_GOAL;
    let vitaminLabel = '—';
    let vitaminStyle = styles.vitaminMuted;
    if (item.isVitaminDay) {
      vitaminLabel = item.vitaminTaken ? 'Taken' : 'Missed';
      vitaminStyle = item.vitaminTaken ? styles.vitaminTaken : styles.vitaminMissed;
    }

    return (
      <View style={styles.row}>
        <Text style={styles.dayLabel}>{formatDayLabel(item.dateKey)}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, waterComplete ? styles.waterComplete : styles.waterPartial]}>
            <Text style={styles.badgeText}>💧 {item.waterCount}/{WATER_GOAL}</Text>
          </View>
          <View style={[styles.badge, vitaminStyle]}>
            <Text style={styles.badgeText}>💊 {vitaminLabel}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>This Week</Text>
        <FlatList
          data={days}
          keyExtractor={(item) => item.dateKey}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  waterComplete: {
    backgroundColor: COLORS.accent,
  },
  waterPartial: {
    backgroundColor: '#EAF3F0',
  },
  vitaminTaken: {
    backgroundColor: COLORS.accent,
  },
  vitaminMissed: {
    backgroundColor: COLORS.alert,
  },
  vitaminMuted: {
    backgroundColor: '#EAF3F0',
  },
});
