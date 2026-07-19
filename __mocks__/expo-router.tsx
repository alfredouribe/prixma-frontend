import React from 'react';

export const router = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

export const useRouter = jest.fn(() => router);

export const useLocalSearchParams = jest.fn(() => ({}));

/**
 * Simplificado para tests: corre el callback como un efecto normal de
 * React (una vez al montar, si la referencia es estable) en vez de atarlo
 * al ciclo de vida real de foco/desenfoque de la navegación. Suficiente
 * para hooks que solo cargan datos "al entrar a la pantalla". Usa
 * `React.useEffect` en vez de invocar el callback directamente durante el
 * render, que dispararía "too many re-renders" si el efecto hace setState.
 */
export const useFocusEffect = jest.fn((effect: () => void | (() => void)) => {
  React.useEffect(() => effect(), [effect]);
});

export const Redirect = jest.fn(({ href: _href }: { href: string }) => null);

const Stack = Object.assign(jest.fn(() => null), {
  Screen: jest.fn(() => null),
});
export { Stack };

export const Link = jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>);
