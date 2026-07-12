import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { VerificationStatusScreen } from '../VerificationStatusScreen';
import { useVerificationStatus } from '../../hooks/useVerificationStatus';
import type { VerificationStatusData } from '../../types/verification.types';

jest.mock('../../hooks/useVerificationStatus');

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

    render(<VerificationStatusScreen />);

    fireEvent.press(screen.getByText('Entendido'));

    expect(router.push).toHaveBeenCalledWith('/(app)/profile');
  });

  it('llama a onGoToExplore al tocar "Ir a explorar" cuando la solicitud fue aprobada', () => {
    (useVerificationStatus as jest.Mock).mockReturnValue({
      status: buildStatus({ status: 'approved' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
    });
    const onGoToExplore = jest.fn();

    render(<VerificationStatusScreen onGoToExplore={onGoToExplore} />);

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

    render(<VerificationStatusScreen onRetry={onRetry} />);

    fireEvent.press(screen.getByText('¿Lo intentamos de nuevo?'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
