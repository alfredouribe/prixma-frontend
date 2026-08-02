export const GestureHandlerRootView = ({ children }: { children: React.ReactNode }) => children;
export const PanGestureHandler = ({ children }: { children: React.ReactNode }) => children;
export const TapGestureHandler = ({ children }: { children: React.ReactNode }) => children;
export const State = {};
export const Directions = {};

/**
 * Mock de la API de gestos v2 (`Gesture.Pan()...onUpdate().onEnd()`), usada
 * por `useSwipeGesture` (compartido entre `ProfileCard` y `AdCard` de
 * Premium — ver features/premium/specs/plan.md). Sin runtime nativo bajo
 * jest-expo no hay forma de simular un pan gesture real; en vez de eso este
 * stub registra cada handler en `_handlers` para que los tests lo disparen
 * a mano (ej. `gesture._handlers.onEnd({ translationX: 400, translationY: 0 })`),
 * mismo criterio ya usado en el mock de react-native-reanimated de esta
 * carpeta (`runOnJS` ejecuta síncrono, sin worklets reales).
 */
type GestureCallback = (...args: never[]) => void;

export interface MockGesture {
  onUpdate: (cb: GestureCallback) => MockGesture;
  onEnd: (cb: GestureCallback) => MockGesture;
  onStart: (cb: GestureCallback) => MockGesture;
  onBegin: (cb: GestureCallback) => MockGesture;
  onFinalize: (cb: GestureCallback) => MockGesture;
  _handlers: Record<string, GestureCallback | undefined>;
}

function createMockGesture(): MockGesture {
  const handlers: Record<string, GestureCallback | undefined> = {};
  const gesture: MockGesture = {
    onUpdate: (cb) => {
      handlers.onUpdate = cb;
      return gesture;
    },
    onEnd: (cb) => {
      handlers.onEnd = cb;
      return gesture;
    },
    onStart: (cb) => {
      handlers.onStart = cb;
      return gesture;
    },
    onBegin: (cb) => {
      handlers.onBegin = cb;
      return gesture;
    },
    onFinalize: (cb) => {
      handlers.onFinalize = cb;
      return gesture;
    },
    _handlers: handlers,
  };
  return gesture;
}

export const Gesture = {
  Pan: () => createMockGesture(),
  Tap: () => createMockGesture(),
};

export const GestureDetector = ({ children }: { children: React.ReactNode }) => children;
