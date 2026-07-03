import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants/colors';

export default function VitaminToggle({ taken, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, taken ? styles.taken : styles.notTaken]}
      accessibilityRole="button"
      accessibilityLabel={`Vitamin ${taken ? 'taken' : 'not taken'} today`}
    >
      <Text style={styles.emoji}>💊</Text>
      <Text style={styles.title}>{taken ? 'Vitamin taken today' : 'Tap when you take your vitamin'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  notTaken: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
  },
  taken: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
});
