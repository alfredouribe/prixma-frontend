import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { ExploreProfile, SwipeDirection } from '../types/matching.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const SWIPE_UP_THRESHOLD = 100;

const INTENTION_LABELS: Record<string, string> = {
  partner: 'Busca pareja',
  friendship: 'Busca amistad',
  community: 'Busca comunidad',
  mentorship: 'Busca mentoría',
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
              if (finished) onSwipe('like');
            });
          } else if (movedLeft) {
            translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, (finished) => {
              'worklet';
              if (finished) onSwipe('dislike');
            });
          } else if (movedUp) {
            translateY.value = withSpring(-SCREEN_WIDTH * 1.5, {}, (finished) => {
              'worklet';
              if (finished) onSwipe('super_like');
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

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="person" size={96} color="#3a3a4a" />
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

          {/* Badges */}
          <View style={styles.badgesOverlay}>
            {profile.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#33d17a" />
                <Text style={styles.verifiedText}>✓ Verificade</Text>
              </View>
            )}
            {profile.intention && (
              <View style={styles.intentionBadge}>
                <Text style={styles.intentionText}>
                  {INTENTION_LABELS[profile.intention] ?? profile.intention}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.display_name}, {profile.age}
            </Text>
            {profile.has_video && (
              <Ionicons name="play-circle-outline" size={22} color="#9b5dff" />
            )}
          </View>

          {profile.pronouns.length > 0 && (
            <Text style={styles.pronouns}>{profile.pronouns.join(' · ')}</Text>
          )}

          <Text style={styles.identity}>
            {[...profile.gender_identities, ...profile.orientations].join(' · ')}
            {profile.city ? ` · ${profile.city}` : ''}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#17171f',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#9b5dff',
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
    backgroundColor: '#2a2a38',
  },
  photoPlaceholder: {
    backgroundColor: '#2a2a38',
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
    top: 12,
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
    backgroundColor: '#ffffff',
  },
  badgesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(51, 209, 122, 0.15)',
    borderWidth: 0.5,
    borderColor: '#33d17a',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 11,
    color: '#33d17a',
  },
  intentionBadge: {
    backgroundColor: 'rgba(155, 93, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: '#9b5dff',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  intentionText: {
    fontFamily: 'PoppinsRounded-Medium',
    fontSize: 11,
    color: '#9b5dff',
  },
  info: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  pronouns: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 13,
    color: '#a0a0b8',
    marginBottom: 4,
  },
  identity: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 13,
    color: '#a0a0b8',
  },
});
