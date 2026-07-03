import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { WEEKDAY_LABELS } from '../utils/dateUtils';

export default function WeekdayPicker({ selectedDays, onToggleDay }) {
  return (
    <View style={styles.row}>
      {WEEKDAY_LABELS.map((label, index) => {
        const selected = selectedDays.includes(index);
        return (
          <Pressable
            key={label}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onToggleDay(index)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label[0]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  chipSelected: {
    backgroundColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
});
