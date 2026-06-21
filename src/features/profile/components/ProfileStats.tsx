import { View, Text, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { ProfileStats as ProfileStatsType } from '../types/profile.types';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      <StatItem icon="❤️" value={stats.likes_received} label="Likes" color={colors.rose} />
      <View style={styles.divider} />
      <StatItem icon="✨" value={stats.matches_count} label="Matches" color={colors.yellow} />
      <View style={styles.divider} />
      <StatItem icon="🎉" value={stats.events_count} label="Eventos" color={colors.blue} />
    </View>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    ...typography.h3,
  },
  label: {
    ...typography.caption,
    color: text.secondary,
  },
  divider: {
    width: 1,
    backgroundColor: surfaces.border,
    marginVertical: spacing.xs,
  },
});
