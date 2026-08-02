import { render } from '@testing-library/react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { AdCard } from '../AdCard';

// El mock de `react-native-gesture-handler` (`__mocks__/react-native-gesture-handler.ts`)
// expone los handlers registrados en `Gesture.Pan().onEnd(cb)` vía
// `gesture._handlers` — no es parte de la API real, solo existe bajo test
// (no hay runtime nativo para simular un pan gesture de verdad).
interface MockGestureHandlers {
  onEnd?: (e: { translationX: number; translationY: number }) => void;
}

function getGestureHandlers(detectorProps: unknown): MockGestureHandlers {
  const { gesture } = detectorProps as { gesture: { _handlers: MockGestureHandlers } };
  return gesture._handlers;
}

describe('AdCard', () => {
  it('renderiza contenido promocional de Prixma+', () => {
    const { getByText } = render(<AdCard onDismiss={jest.fn()} />);
    expect(getByText('Prixma+')).toBeTruthy();
    expect(getByText('Actualiza tu plan')).toBeTruthy();
  });

  it('al soltar el gesto hacia la derecha, avanza a la siguiente card sin llamar a ningún servicio de swipe', () => {
    const onDismiss = jest.fn();
    const { UNSAFE_getByType } = render(<AdCard onDismiss={onDismiss} />);

    const detector = UNSAFE_getByType(GestureDetector);
    const handlers = getGestureHandlers(detector.props);
    handlers.onEnd?.({ translationX: 400, translationY: 0 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('al soltar el gesto hacia la izquierda, también avanza (cualquier dirección descarta la card)', () => {
    const onDismiss = jest.fn();
    const { UNSAFE_getByType } = render(<AdCard onDismiss={onDismiss} />);

    const detector = UNSAFE_getByType(GestureDetector);
    const handlers = getGestureHandlers(detector.props);
    handlers.onEnd?.({ translationX: -400, translationY: 0 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('un arrastre por debajo del umbral no descarta la card', () => {
    const onDismiss = jest.fn();
    const { UNSAFE_getByType } = render(<AdCard onDismiss={onDismiss} />);

    const detector = UNSAFE_getByType(GestureDetector);
    const handlers = getGestureHandlers(detector.props);
    handlers.onEnd?.({ translationX: 10, translationY: 0 });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
