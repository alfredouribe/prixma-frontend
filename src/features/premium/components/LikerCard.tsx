import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { ExploreProfile } from '../../matching/types/matching.types';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese).
function likeButtonLabel(displayName: string): string {
  return `Dar like a ${displayName}`;
}

interface LikerCardProps {
  profile: ExploreProfile;
  onLike: (profile: ExploreProfile) => void;
  isLiking?: boolean;
}

/**
 * Card de grid para WhoLikedMeScreen — foto + nombre/edad + botón de like.
 * Tocar el botón dispara `onLike` (la screen delega en `useLikers.likeBack`,
 * que reusa `matchingService.swipe()` sin mecanismo nuevo — ver
 * features/premium/specs/spec.md → "Ver quién te dio like").
 */
export function LikerCard({ profile, onLike, isLiking }: LikerCardProps) {
  const photo = profile.photos[0]?.url ?? null;

  return (
    <View style={styles.card} testID={`liker-card-${profile.id}`}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="person" size={40} color={surfaces.muted} />
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.display_name}, {profile.age}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => onLike(profile)}
        disabled={isLiking}
        accessibilityLabel={likeButtonLabel(profile.display_name)}
        accessibilityRole="button"
        testID={`liker-like-btn-${profile.id}`}
      >
        {isLiking ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Ionicons name="heart" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 0.75,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: surfaces.card,
    margin: spacing.xs,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: surfaces.border,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(13,13,20,0.7)',
  },
  name: {
    ...typography.small,
    fontFamily: 'PoppinsRounded-SemiBold',
    color: text.primary,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
