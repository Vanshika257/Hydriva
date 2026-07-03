export const STORAGE_KEYS = {
  RECORDS: '@vitawater/records',
  SETTINGS: '@vitawater/settings',
};

export const DEFAULT_SETTINGS = {
  waterTimes: [
    { hour: 9, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 19, minute: 0 },
  ],
  vitaminTime: { hour: 8, minute: 0 },
  vitaminDays: [1, 2, 3, 4, 5], // 0 = Sunday ... 6 = Saturday
  notificationIds: {
    water: [],
    vitamin: [],
  },
};

export const WATER_GOAL = 3;
