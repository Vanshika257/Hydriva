import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import {
  calculateVitaminStreak,
  calculateWaterStreak,
  getAllRecords,
  getSettings,
} from '../services/storageService';

function StreakCard({ emoji, title, streak }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardStreak}>{streak}</Text>
      <Text style={styles.cardLabel}>{streak === 1 ? 'day streak' : 'day streak'}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const [waterStreak, setWaterStreak] = useState(0);
  const [vitaminStreak, setVitaminStreak] = useState(0);

  const load = useCallback(async () => {
    const [records, settings] = await Promise.all([getAllRecords(), getSettings()]);
    setWaterStreak(calculateWaterStreak(records));
    setVitaminStreak(calculateVitaminStreak(records, settings.vitaminDays));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Streaks</Text>
        <View style={styles.cardRow}>
          <StreakCard emoji="💧" title="Water" streak={waterStreak} />
          <StreakCard emoji="💊" title="Vitamin" streak={vitaminStreak} />
        </View>
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
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardStreak: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardLabel: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  cardTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
});
