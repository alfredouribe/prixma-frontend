import { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile.photos ?? [];
  // El carrusel navegable (tap izquierda/derecha + dots) solo aplica al perfil
  // ajeno — en perfil propio (MyProfileScreen) siempre se muestra la foto
  // principal, igual que antes, para no cambiar ese comportamiento ya probado.
  const carouselEnabled = !isOwn && photos.length > 1;
  const activePhoto = !isOwn ? photos[photoIndex]?.url : photos[0]?.url;
  const photoUrl = activePhoto ?? profile.photo_url;
  const isVerified = isOwn
    ? (profile as MyProfile).verification_status === 'verified'
    : (profile as PublicProfile).is_verified;
  const age = !isOwn ? (profile as PublicProfile).age : null;
  const displayName = age ? `${profile.display_name}, ${age}` : profile.display_name;

  const pronounText = profile.pronouns?.map((p) => p.label).join(' / ');
  const identityText = profile.gender_identities?.map((g) => g.label).join(', ');
  const orientationText = profile.orientations?.map((o) => o.label).join(', ');
  const identityLine = [pronounText, identityText, orientationText].filter(Boolean).join(' · ');

  function goToPhoto(direction: 'prev' | 'next') {
    setPhotoIndex((i) => {
      if (direction === 'next') return Math.min(i + 1, photos.length - 1);
      return Math.max(i - 1, 0);
    });
  }

  return (
    <View style={styles.container}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.placeholderIcon}>👤</Text>
        </View>
      )}

      {carouselEnabled && (
        <>
          <TouchableOpacity
            style={styles.navLeft}
            onPress={() => goToPhoto('prev')}
            accessibilityLabel="Foto anterior"
          />
          <TouchableOpacity
            style={styles.navRight}
            onPress={() => goToPhoto('next')}
            accessibilityLabel="Foto siguiente"
          />
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
            ))}
          </View>
        </>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(13,13,20,0.6)', 'rgba(13,13,20,0.92)']}
        locations={[0.35, 0.68, 1]}
        style={styles.overlay}
        pointerEvents="none"
      />

      <View style={styles.info} pointerEvents="box-none">
        <View style={styles.nameRow}>
          <Text style={styles.name}>{displayName}</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificade</Text>
            </View>
          )}
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
  navLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 1,
  },
  navRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    zIndex: 1,
  },
  dots: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 2,
  },
  dot: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
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
