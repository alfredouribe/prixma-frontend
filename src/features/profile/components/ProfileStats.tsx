import { View, Text, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, spacing } from '../../../lib/theme';
import type { ProfileStats as ProfileStatsType } from '../types/profile.types';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <StatItem value={stats.likes_received} label="Likes" />
      <View style={styles.divider} />
      <StatItem value={stats.matches_count} label="Matches" />
      <View style={styles.divider} />
      <StatItem value={stats.events_count} label="Eventos" />
    </View>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: surfaces.card,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: surfaces.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 2,
  },
  value: {
    ...typography.h3,
    fontFamily: 'PoppinsRounded-Bold',
    color: colors.purple,
  },
  label: {
    ...typography.caption,
    color: text.tertiary,
  },
  divider: {
    width: 0.5,
    backgroundColor: surfaces.border,
    marginVertical: spacing.md,
  },
});
