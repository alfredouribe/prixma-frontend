import { View, Text, StyleSheet } from 'react-native';
import { surfaces, text, typography, radius, spacing, colors } from '../../../lib/theme';
import type { Intention } from '../../onboarding/types/onboarding.types';

const INTENTION_LABELS: Record<string, string> = {
  partner: 'Una pareja',
  friendship: 'Amistades LGBTQ+',
  community: 'Comunidad y activismo',
  mentorship: 'Mentoría',
};

interface ProfileBioProps {
  bio: string | null;
  intention: Intention | null;
}

export function ProfileBio({ bio, intention }: ProfileBioProps) {
  if (!bio && !intention) return null;

  return (
    <View style={styles.container}>
      {bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>{bio}</Text>
        </View>
      ) : null}

      {intention ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Busco</Text>
          <View style={styles.intentionChip}>
            <Text style={styles.intentionText}>{INTENTION_LABELS[intention] ?? intention}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bioText: {
    ...typography.body,
    color: text.primary,
    lineHeight: 24,
  },
  intentionChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(155, 93, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  intentionText: {
    ...typography.small,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-Medium',
  },
});
