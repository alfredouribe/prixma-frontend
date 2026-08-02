import { renderHook, waitFor } from '@testing-library/react-native';
import { usePremiumSettings } from '../usePremiumSettings';
import { premiumService } from '../../services/premiumService';
import type { PremiumSettings } from '../../types/premium.types';

jest.mock('../../services/premiumService');

function buildSettings(overrides: Partial<PremiumSettings> = {}): PremiumSettings {
  return {
    is_premium: false,
    free_swipes_per_ad: 5,
    free_likes_per_day: 5,
    free_chat_minutes_before_ad: 1,
    chat_ad_video_url: null,
    ...overrides,
  };
}

describe('usePremiumSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga los ajustes de premium una sola vez', async () => {
    (premiumService.getSettings as jest.Mock).mockResolvedValue(buildSettings());
    const { result } = renderHook(() => usePremiumSettings());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(premiumService.getSettings).toHaveBeenCalledTimes(1);
    expect(result.current.settings?.free_swipes_per_ad).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('deja settings en null y setea un error si falla la carga', async () => {
    (premiumService.getSettings as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => usePremiumSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });
});
