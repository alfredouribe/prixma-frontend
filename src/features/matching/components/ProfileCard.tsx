import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { ExploreProfile, Intention, SwipeDirection } from '../types/matching.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const SWIPE_UP_THRESHOLD = 100;

const INTENTION_LABELS: Record<Intention, string> = {
  partner: 'Busca pareja',
  friendship: 'Busca amistad',
  community: 'Busca comunidad',
  mentorship: 'Busca mentoría',
};

// Badge de intención sobre la foto — mapeo independiente del de CardActions
// (ese usa Ionicons y la intención del usuario autenticado; este usa emoji
// de texto y la intención del perfil que se está viendo). Ver spec.md.
const INTENTION_EMOJI: Record<Intention, string> = {
  partner: '❤️',
  friendship: '👥',
  community: '🤝',
  mentorship: '✨',
};

interface ProfileCardProps {
  profile: ExploreProfile;
  onSwipe: (direction: SwipeDirection) => void;
}

export function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const photos = profile.photos;

  function advancePhoto(direction: 'next' | 'prev') {
    setPhotoIndex((i) => {
      if (direction === 'next') return Math.min(i + 1, photos.length - 1);
      return Math.max(i - 1, 0);
    });
  }

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          'worklet';
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd((e) => {
          'worklet';
          const movedRight = e.translationX > SWIPE_THRESHOLD;
          const movedLeft = e.translationX < -SWIPE_THRESHOLD;
          const movedUp =
            e.translationY < -SWIPE_UP_THRESHOLD &&
            Math.abs(e.translationX) < SWIPE_THRESHOLD;

          if (movedRight) {
            translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, (finished) => {
              'worklet';
              if (finished) runOnJS(onSwipe)('like');
            });
          } else if (movedLeft) {
            translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, (finished) => {
              'worklet';
              if (finished) runOnJS(onSwipe)('dislike');
            });
          } else if (movedUp) {
            translateY.value = withSpring(-SCREEN_WIDTH * 1.5, {}, (finished) => {
              'worklet';
              if (finished) runOnJS(onSwipe)('super_like');
            });
          } else {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
          }
        }),
    [onSwipe, translateX, translateY],
  );

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const currentPhoto = photos[photoIndex]?.url ?? null;
  const visibleInterests = profile.interests.slice(0, 3);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="person" size={96} color={surfaces.muted} />
            </View>
          )}

          {/* Photo navigation areas */}
          <TouchableOpacity
            style={styles.photoNavLeft}
            onPress={() => advancePhoto('prev')}
            accessibilityLabel="Foto anterior"
          />
          <TouchableOpacity
            style={styles.photoNavRight}
            onPress={() => advancePhoto('next')}
            accessibilityLabel="Foto siguiente"
          />

          {/* Photo dots */}
          {photos.length > 1 && (
            <View style={styles.dots}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Verified badge — pill sólido verde, top-right */}
          {profile.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificade</Text>
            </View>
          )}

          {/* Intention badge — pill oscuro translúcido, bottom-left */}
          {profile.intention && (
            <View style={styles.intentionBadge}>
              <Text style={styles.intentionText}>
                {INTENTION_EMOJI[profile.intention]} {INTENTION_LABELS[profile.intention]}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.display_name}, {profile.age}
            </Text>
            {profile.pronouns.length > 0 && (
              <View style={styles.pronounsBadge}>
                <Text style={styles.pronounsText}>{profile.pronouns.join(' / ')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.identity}>
            {[...profile.gender_identities, ...profile.orientations].join(' · ')}
            {profile.city ? ` · ${profile.city}` : ''}
          </Text>

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={1}>
              {profile.bio}
            </Text>
          )}

          {visibleInterests.length > 0 && (
            <View style={styles.chips}>
              {visibleInterests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    height: 420,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: surfaces.border,
  },
  photoPlaceholder: {
    backgroundColor: surfaces.border,
  },
  photoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  photoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
  },
  dots: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
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
  verifiedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: typography.caption.fontSize,
    color: colors.white,
  },
  intentionBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(13,13,20,0.7)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  intentionText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: typography.small.fontSize,
    color: colors.white,
  },
  info: {
    padding: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 20,
    color: text.primary,
  },
  pronounsBadge: {
    backgroundColor: 'rgba(155, 93, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pronounsText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: typography.caption.fontSize,
    color: colors.purple,
  },
  identity: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: typography.small.fontSize,
    color: text.secondary,
    marginBottom: spacing.xs,
  },
  bio: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: typography.small.fontSize,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: surfaces.bg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: typography.small.fontSize,
    color: text.secondary,
  },
});
