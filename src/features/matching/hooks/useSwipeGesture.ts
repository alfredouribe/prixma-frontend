import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { SwipeDirection } from '../types/matching.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const SWIPE_UP_THRESHOLD = 100;

/**
 * Gesto de swipe compartido por `ProfileCard` (perfiles reales) y `AdCard`
 * (cards de publicidad de Premium, ver features/premium/specs/plan.md) —
 * mismo pan gesture, mismo spring, misma interpretación de dirección
 * (derecha=like, izquierda=dislike, arriba=super_like). Extraído de
 * `ProfileCard.tsx` sin cambiar el comportamiento: cada llamador decide qué
 * hacer con la dirección resultante — `AdCard` simplemente la ignora y
 * avanza a la siguiente card, nunca llama a `matchingService.swipe()`.
 */
export function useSwipeGesture(onSwipe: (direction: SwipeDirection) => void) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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

  return { pan, cardStyle };
}
