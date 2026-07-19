/**
 * Manual jest mock for expo-video.
 *
 * The real package initializes a native `VideoPlayer` class at import time
 * (`expo-video/src/VideoPlayer.tsx`), which crashes under jest-expo with
 * "Cannot read properties of undefined (reading 'prototype')" because there
 * is no native runtime in the test environment. This mock covers only the
 * APIs this codebase actually uses (`VideoView`, `useVideoPlayer` with
 * `.loop`, `.play()`, `.pause()`, `.replace()`), same approach already used
 * for react-native-reanimated in this folder.
 */
import React from 'react';
import { View } from 'react-native';

export interface MockVideoPlayer {
  loop: boolean;
  play: () => void;
  pause: () => void;
  replace: (source: unknown) => void;
}

export function useVideoPlayer(
  _source: unknown,
  setup?: (player: MockVideoPlayer) => void,
): MockVideoPlayer {
  const player: MockVideoPlayer = {
    loop: false,
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
  };
  setup?.(player);
  return player;
}

export const VideoView = (props: Record<string, unknown>) => (
  <View testID="video-view">{props.children as React.ReactNode}</View>
);
