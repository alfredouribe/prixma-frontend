import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VerificationStatusScreen } from '../VerificationStatusScreen';
import { useVerificationStatus } from '../../hooks/useVerificationStatus';
import type { VerificationStatusData } from '../../types/verification.types';

jest.mock('../../hooks/useVerificationStatus');

// `BackButton` usa `useSafeAreaInsets()` (real bug 2026-09-27: el botón
// necesita el inset real, no un `top` fijo, para no quedar bajo la barra de
// estado — ver la nota completa en VerificationTeaserScreen.tsx). Ese hook
// exige un `<SafeAreaProvider>` como ancestro o lanza en tiempo real.
const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen(props: Parameters<typeof VerificationStatusScreen>[0] = {}) {
  return render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <VerificationStatusScreen {...props} />
    </SafeAreaProvider>,
  );
}

function buildStatus(overrides: Partial<VerificationStatusData>): VerificationStatusData {
  return {
    id: 'req-1',
    status: 'pending',
    rejection_reason: null,
    reviewed_at: null,
    created_at: '2026-07-09T00:00:00Z',
    ...overrides,
  };
}

describe('VerificationStatusScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navega al perfil propio al tocar "Entendido" cuando la solicitud está pendiente', () => {
    (useVerificationStatus as jest.Mock).mockReturnValue({
      status: buildStatus({ status: 'pending' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
    });

    renderScreen();

    fireEvent.press(screen.getByText('Entendido'));

    expect(router.push).toHaveBeenCalledWith('/(app)/(tabs)/profile');
  });

  it('llama a onGoToExplore al tocar "Ir a explorar" cuando la solicitud fue aprobada', () => {
    (useVerificationStatus as jest.Mock).mockReturnValue({
      status: buildStatus({ status: 'approved' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
    });
    const onGoToExplore = jest.fn();

    renderScreen({ onGoToExplore });

    fireEvent.press(screen.getByText('Ir a explorar'));

    expect(onGoToExplore).toHaveBeenCalledTimes(1);
  });

  it('llama a onRetry al tocar "¿Lo intentamos de nuevo?" cuando la solicitud fue rechazada', () => {
    (useVerificationStatus as jest.Mock).mockReturnValue({
      status: buildStatus({ status: 'rejected', rejection_reason: 'La foto estaba borrosa' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
    });
    const onRetry = jest.fn();

    renderScreen({ onRetry });

    fireEvent.press(screen.getByText('¿Lo intentamos de nuevo?'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('no muestra botón de volver cuando no se pasa onBack (uso desde el gate de Explorar)', () => {
    (useVerificationStatus as jest.Mock).mockReturnValue({
      status: buildStatus({ status: 'pending' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
    });

    renderScreen();

    expect(screen.queryByLabelText('Volver')).toBeNull();
  });

  it.each(['pending', 'approved', 'rejected'] as const)(
    'bug real 2026-09-27: muestra botón de volver y llama a onBack en estado %s (entrada desde Configuración del perfil)',
    (status) => {
      (useVerificationStatus as jest.Mock).mockReturnValue({
        status: buildStatus({ status }),
        isLoading: false,
        error: null,
        reload: jest.fn(),
      });
      const onBack = jest.fn();

      renderScreen({ onBack });

      fireEvent.press(screen.getByLabelText('Volver'));

      expect(onBack).toHaveBeenCalledTimes(1);
    },
  );
});
