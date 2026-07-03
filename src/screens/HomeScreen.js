import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import VitaminToggle from '../components/VitaminToggle';
import WaterGlass from '../components/WaterGlass';
import { COLORS } from '../constants/colors';
import { getRecordForDate, toggleVitamin, toggleWaterGlass } from '../services/storageService';
import { getTodayKey } from '../utils/dateUtils';

const WATER_LABELS = ['Morning', 'Afternoon', 'Evening'];

export default function HomeScreen() {
  const [record, setRecord] = useState({ water: [false, false, false], vitamin: false });
  const todayKey = getTodayKey();

  const loadRecord = useCallback(async () => {
    const today = await getRecordForDate(todayKey);
    setRecord(today);
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      loadRecord();
    }, [loadRecord])
  );

  const handleWaterPress = async (index) => {
    const updated = await toggleWaterGlass(todayKey, index);
    setRecord(updated);
  };

  const handleVitaminPress = async () => {
    const updated = await toggleVitamin(todayKey);
    setRecord(updated);
  };

  const waterCount = record.water.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Today</Text>
        <Text style={styles.subheading}>{waterCount} / 3 glasses of water</Text>

        <View style={styles.glassRow}>
          {WATER_LABELS.map((label, index) => (
            <WaterGlass
              key={label}
              label={label}
              filled={record.water[index]}
              onPress={() => handleWaterPress(index)}
            />
          ))}
        </View>

        <Text style={[styles.subheading, styles.vitaminHeading]}>Vitamin</Text>
        <VitaminToggle taken={record.vitamin} onPress={handleVitaminPress} />
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
  },
  subheading: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 20,
  },
  vitaminHeading: {
    marginTop: 32,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
