import { renderHook, waitFor } from '@testing-library/react-native';
import { useVerificationStatus } from '../useVerificationStatus';
import { verificationService } from '../../services/verificationService';
import type { VerificationStatusData } from '../../types/verification.types';

jest.mock('../../services/verificationService');

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

describe('useVerificationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expone el estado pending tras cargar', async () => {
    (verificationService.getStatus as jest.Mock).mockResolvedValue(buildStatus({ status: 'pending' }));

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status?.status).toBe('pending');
    expect(result.current.error).toBeNull();
  });

  it('expone el estado rejected con el motivo de rechazo', async () => {
    (verificationService.getStatus as jest.Mock).mockResolvedValue(
      buildStatus({ status: 'rejected', rejection_reason: 'La foto estaba borrosa' }),
    );

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status?.status).toBe('rejected');
    expect(result.current.status?.rejection_reason).toBe('La foto estaba borrosa');
  });

  it('expone el estado approved (verificade)', async () => {
    (verificationService.getStatus as jest.Mock).mockResolvedValue(
      buildStatus({ status: 'approved', reviewed_at: '2026-07-09T10:00:00Z' }),
    );

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status?.status).toBe('approved');
  });

  it('expone un error legible si la carga falla', async () => {
    (verificationService.getStatus as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useVerificationStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });
});
