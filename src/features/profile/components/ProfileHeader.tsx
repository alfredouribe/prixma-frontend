import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { MyProfile, PublicProfile } from '../types/profile.types';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = width * 1.1;

type ProfileHeaderProps = {
  profile: MyProfile | PublicProfile;
  isOwn?: boolean;
};

const INTENTION_LABELS: Record<string, string> = {
  partner: 'Busca pareja',
  friendship: 'Busca amistad',
  community: 'Busca comunidad',
  mentorship: 'Busca mentoría',
};

export function ProfileHeader({ profile, isOwn = false }: ProfileHeaderProps) {
  const photoUrl = profile.photos?.[0]?.url ?? profile.photo_url;
  const pronounLabels = profile.pronouns?.map((p) => p.label).join(', ');

  return (
    <View style={styles.container}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderIcon}>👤</Text>
        </View>
      )}

      <View style={styles.overlay} />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.display_name}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {pronounLabels ? (
            <View style={styles.pronounChip}>
              <Text style={styles.pronounText}>{pronounLabels}</Text>
            </View>
          ) : null}

          {profile.city ? (
            <View style={styles.cityRow}>
              <Text style={styles.cityIcon}>📍</Text>
              <Text style={styles.cityText}>{profile.city}</Text>
            </View>
          ) : null}
        </View>

        {!isOwn && profile.intention ? (
          <View style={styles.intentionBadge}>
            <Text style={styles.intentionText}>
              {INTENTION_LABELS[profile.intention] ?? profile.intention}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: PHOTO_HEIGHT,
    backgroundColor: surfaces.card,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 55%)',
  } as object,
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.h1,
    color: colors.white,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: colors.white,
    fontFamily: 'PoppinsRounded-Bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pronounChip: {
    backgroundColor: 'rgba(155, 93, 255, 0.25)',
    borderWidth: 0.5,
    borderColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pronounText: {
    ...typography.small,
    color: colors.white,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityIcon: { fontSize: 13 },
  cityText: {
    ...typography.small,
    color: text.secondary,
  },
  intentionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 94, 125, 0.2)',
    borderWidth: 0.5,
    borderColor: colors.rose,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  intentionText: {
    ...typography.small,
    color: colors.rose,
  },
});
