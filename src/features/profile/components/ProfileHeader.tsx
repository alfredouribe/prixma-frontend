import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, surfaces, typography, radius, spacing } from '../../../lib/theme';
import type { MyProfile, PublicProfile } from '../types/profile.types';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = Math.round(width * 1.1);

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

  const pronounText = profile.pronouns?.map((p) => p.label).join(' / ');
  const identityText = profile.gender_identities?.map((g) => g.label).join(', ');
  const orientationText = profile.orientations?.map((o) => o.label).join(', ');
  const identityLine = [pronounText, identityText, orientationText].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderIcon}>👤</Text>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(13,13,20,0.6)', 'rgba(13,13,20,0.92)']}
        locations={[0.35, 0.68, 1]}
        style={styles.overlay}
        pointerEvents="none"
      />

      <View style={styles.info} pointerEvents="box-none">
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.display_name}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verificade</Text>
          </View>
        </View>

        {identityLine ? (
          <Text style={styles.identityLine}>{identityLine}</Text>
        ) : null}

        {profile.city ? (
          <View style={styles.cityRow}>
            <Text style={styles.cityIcon}>📍</Text>
            <Text style={styles.cityText}>{profile.city}</Text>
          </View>
        ) : null}

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
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
    zIndex: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.h1,
    color: colors.white,
  },
  verifiedBadge: {
    backgroundColor: colors.green,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  identityLine: {
    ...typography.small,
    color: 'rgba(216, 214, 240, 0.9)',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityIcon: { fontSize: 13 },
  cityText: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.55)',
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
