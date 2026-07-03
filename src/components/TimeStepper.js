import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { formatTime } from '../utils/dateUtils';

const MINUTE_STEP = 5;

function StepButton({ label, onPress }) {
  return (
    <Pressable style={styles.stepButton} onPress={onPress} hitSlop={8}>
      <Text style={styles.stepButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function TimeStepper({ label, value, onChange }) {
  const changeHour = (delta) => {
    const hour = (value.hour + delta + 24) % 24;
    onChange({ ...value, hour });
  };

  const changeMinute = (delta) => {
    let minute = value.minute + delta;
    let hour = value.hour;
    if (minute >= 60) {
      minute -= 60;
      hour = (hour + 1) % 24;
    } else if (minute < 0) {
      minute += 60;
      hour = (hour - 1 + 24) % 24;
    }
    onChange({ hour, minute });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.unit}>
          <StepButton label="−" onPress={() => changeHour(-1)} />
          <Text style={styles.unitValue}>{String(value.hour).padStart(2, '0')}</Text>
          <StepButton label="+" onPress={() => changeHour(1)} />
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.unit}>
          <StepButton label="−" onPress={() => changeMinute(-MINUTE_STEP)} />
          <Text style={styles.unitValue}>{String(value.minute).padStart(2, '0')}</Text>
          <StepButton label="+" onPress={() => changeMinute(MINUTE_STEP)} />
        </View>
        <Text style={styles.preview}>{formatTime(value.hour, value.minute)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 28,
    textAlign: 'center',
  },
  colon: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  preview: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
