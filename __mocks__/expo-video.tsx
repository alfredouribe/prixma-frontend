/**
 * Manual jest mock for expo-video.
 *
 * The real package initializes a native `VideoPlayer` class at import time
 * (`expo-video/src/VideoPlayer.tsx`), which crashes under jest-expo with
 * "Cannot read properties of undefined (reading 'prototype')" because there
 * is no native runtime in the test environment. This mock covers only the
 * APIs this codebase actually uses (`VideoView`, `useVideoPlayer` with
 * `.loop`, `.play()`, `.pause()`, `.replace()`, `.addListener()`/
 * `.removeListener()`), same approach already used for
 * react-native-reanimated in this folder.
 *
 * The player is memoized via `useRef` across re-renders of the calling
 * component (matches the real hook's behavior) — without this, a component
 * that re-renders after `useVideoPlayer()` runs (e.g. on a state update)
 * would get a brand-new mock player each time, silently dropping any
 * `.addListener()` subscription registered against the previous instance.
 */
import React from 'react';
import { View } from 'react-native';

type Listener = (...args: unknown[]) => void;

export interface MockVideoPlayer {
  loop: boolean;
  play: () => void;
  pause: () => void;
  replace: (source: unknown) => void;
  addListener: (event: string, listener: Listener) => { remove: () => void };
  removeListener: (event: string, listener: Listener) => void;
}

// Test-only registry so specs can grab the player instance a component
// created (there's no other handle to it from the outside) and simulate
// events like `playToEnd`. Not part of the real expo-video API — only
// exists in this manual mock. Cleared with `__resetMockVideoPlayers()`
// between tests to avoid leaking instances across `it()` blocks.
export const __mockVideoPlayers: MockVideoPlayer[] = [];

export function __resetMockVideoPlayers() {
  __mockVideoPlayers.length = 0;
}

export function __emitPlayerEvent(player: MockVideoPlayer, event: string, ...args: unknown[]) {
  const listeners = (player as unknown as { _listeners: Map<string, Set<Listener>> })._listeners;
  listeners.get(event)?.forEach((fn) => fn(...args));
}

export function useVideoPlayer(
  _source: unknown,
  setup?: (player: MockVideoPlayer) => void,
): MockVideoPlayer {
  const ref = React.useRef<MockVideoPlayer | null>(null);

  if (!ref.current) {
    const listeners = new Map<string, Set<Listener>>();
    const player: MockVideoPlayer = {
      loop: false,
      play: jest.fn(),
      pause: jest.fn(),
      replace: jest.fn(),
      addListener: (event, listener) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)?.add(listener);
        return { remove: () => listeners.get(event)?.delete(listener) };
      },
      removeListener: (event, listener) => {
        listeners.get(event)?.delete(listener);
      },
    };
    Object.defineProperty(player, '_listeners', { value: listeners, enumerable: false });
    setup?.(player);
    ref.current = player;
    __mockVideoPlayers.push(player);
  }

  return ref.current;
}

export const VideoView = (props: Record<string, unknown>) => (
  <View testID="video-view">{props.children as React.ReactNode}</View>
);
