import { View, Text, StyleSheet } from 'react-native';
import { surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { Interest } from '../../onboarding/types/onboarding.types';

interface ProfileInterestsProps {
  interests: Interest[];
  customInterests?: string | null;
}

export function ProfileInterests({ interests, customInterests }: ProfileInterestsProps) {
  const customItems = customInterests
    ? customInterests.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  if (interests.length === 0 && customItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Intereses</Text>
      <View style={styles.chips}>
        {interests.map((interest) => (
          <View key={interest.id} style={styles.chip}>
            <Text style={styles.chipText}>{interest.label}</Text>
          </View>
        ))}
        {customItems.map((item, index) => (
          <View key={`custom-${index}`} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: surfaces.elevated,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    ...typography.small,
    color: text.primary,
  },
});
