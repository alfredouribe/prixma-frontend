/**
 * Manual jest mock for react-native-reanimated.
 *
 * `react-native-reanimated/mock` (used in v3) delegated straight to this
 * package. In v4 that mock re-imports the real package internals, which now
 * initializes the separate `react-native-worklets` native module at import
 * time and throws `WorkletsError: Native part of Worklets doesn't seem to be
 * initialized` under jest-expo, where no native runtime exists. Rather than
 * depend on the real package, this is a small standalone mock covering only
 * the APIs this codebase actually uses (useSharedValue, useAnimatedStyle,
 * withTiming, withSpring, interpolate, Animated.View/Text/Image) — runs
 * synchronously, no worklets involved.
 */
import React from 'react';
import { Image, Text, View } from 'react-native';

export function useSharedValue<T>(initial: T): { value: T } {
  const ref = React.useRef({ value: initial });
  return ref.current;
}

export function useAnimatedStyle<T>(factory: () => T): T {
  return factory();
}

export function useAnimatedProps<T>(factory: () => T): T {
  return factory();
}

type AnimationCallback = (finished?: boolean) => void;

export function withTiming(toValue: number, _config?: unknown, callback?: AnimationCallback) {
  callback?.(true);
  return toValue;
}

export function withSpring(toValue: number, _config?: unknown, callback?: AnimationCallback) {
  callback?.(true);
  return toValue;
}

export function withDecay(config: { velocity?: number }, callback?: AnimationCallback) {
  callback?.(true);
  return config?.velocity ?? 0;
}

export function interpolate(
  value: number,
  inputRange: number[],
  outputRange: number[],
): number {
  if (value <= inputRange[0]) return outputRange[0];
  if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

  for (let i = 0; i < inputRange.length - 1; i += 1) {
    const start = inputRange[i];
    const end = inputRange[i + 1];
    if (value >= start && value <= end) {
      const ratio = (value - start) / (end - start);
      return outputRange[i] + ratio * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[outputRange.length - 1];
}

export const Extrapolation = { EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity' };

export function runOnJS<T extends (...args: never[]) => unknown>(fn: T) {
  return fn;
}

export function runOnUI<T extends (...args: never[]) => unknown>(fn: T) {
  return fn;
}

const Animated = { View, Text, Image, createAnimatedComponent: <T,>(Component: T) => Component };

export default Animated;
