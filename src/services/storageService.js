import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, STORAGE_KEYS, WATER_GOAL } from '../constants/storage';
import { getDateKey, getTodayKey, getWeekdayFromKey } from '../utils/dateUtils';

function emptyDayRecord() {
  return { water: [false, false, false], vitamin: false };
}

export async function getAllRecords() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
  return raw ? JSON.parse(raw) : {};
}

export async function getRecordForDate(dateKey) {
  const records = await getAllRecords();
  return records[dateKey] || emptyDayRecord();
}

async function saveAllRecords(records) {
  await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export async function toggleWaterGlass(dateKey, glassIndex) {
  const records = await getAllRecords();
  const day = records[dateKey] || emptyDayRecord();
  const water = [...day.water];
  water[glassIndex] = !water[glassIndex];
  records[dateKey] = { ...day, water };
  await saveAllRecords(records);
  return records[dateKey];
}

export async function toggleVitamin(dateKey) {
  const records = await getAllRecords();
  const day = records[dateKey] || emptyDayRecord();
  records[dateKey] = { ...day, vitamin: !day.vitamin };
  await saveAllRecords(records);
  return records[dateKey];
}

export async function getSettings() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Consecutive days (walking back from today) where all 3 water glasses were taken.
// Today is given a "grace pass" while incomplete so an in-progress day doesn't break the streak.
export function calculateWaterStreak(records) {
  const todayRecord = records[getTodayKey()];
  const todayComplete = !!todayRecord && todayRecord.water.filter(Boolean).length >= WATER_GOAL;

  const cursor = new Date();
  if (!todayComplete) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    const key = getDateKey(cursor);
    const record = records[key];
    const complete = !!record && record.water.filter(Boolean).length >= WATER_GOAL;
    if (!complete) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Consecutive scheduled vitamin days (per vitaminDays weekday picker) where the vitamin was taken.
// Non-scheduled days are skipped over and don't break the streak.
export function calculateVitaminStreak(records, vitaminDays) {
  if (!vitaminDays || vitaminDays.length === 0) return 0;

  const todayWeekday = new Date().getDay();
  const todayRecord = records[getTodayKey()];
  const todayTaken = !!todayRecord && todayRecord.vitamin;
  const isTodayScheduled = vitaminDays.includes(todayWeekday);

  const cursor = new Date();
  if (isTodayScheduled && !todayTaken) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    const key = getDateKey(cursor);
    const weekday = getWeekdayFromKey(key);
    if (vitaminDays.includes(weekday)) {
      const record = records[key];
      const taken = !!record && record.vitamin;
      if (!taken) break;
      streak += 1;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
