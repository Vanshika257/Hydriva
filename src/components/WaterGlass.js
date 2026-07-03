import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants/colors';

export default function WaterGlass({ label, filled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.circle, filled ? styles.filled : styles.empty]}
      accessibilityRole="button"
      accessibilityLabel={`${label} water glass, ${filled ? 'taken' : 'not taken'}`}
    >
      <Text style={styles.emoji}>💧</Text>
      <Text style={[styles.label, filled && styles.labelFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  empty: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  filled: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.text,
  },
  labelFilled: {
    fontWeight: '700',
  },
});
