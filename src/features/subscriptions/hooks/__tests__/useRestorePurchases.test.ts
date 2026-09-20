import { renderHook, act } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';
import { useRestorePurchases } from '../useRestorePurchases';
import { premiumService } from '../../../premium/services/premiumService';

jest.mock('../../../premium/services/premiumService');

describe('useRestorePurchases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (premiumService.getSettings as jest.Mock).mockResolvedValue({});
  });

  it('restaura exitosamente: resuelve true, sin error, refresca /premium/settings (best-effort)', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({ entitlements: { active: {} } });

    const { result } = renderHook(() => useRestorePurchases());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.restore();
    });

    expect(success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(premiumService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('en error, resuelve false y expone un mensaje de error', async () => {
    (Purchases.restorePurchases as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useRestorePurchases());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.restore();
    });

    expect(success).toBe(false);
    expect(result.current.error).toMatch(/no se pudieron restaurar/i);
  });

  it('isRestoring vuelve a false tras completar', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({ entitlements: { active: {} } });

    const { result } = renderHook(() => useRestorePurchases());

    await act(async () => {
      await result.current.restore();
    });

    expect(result.current.isRestoring).toBe(false);
  });

  it('resetea el error en cada nuevo intento', async () => {
    (Purchases.restorePurchases as jest.Mock)
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ entitlements: { active: {} } });

    const { result } = renderHook(() => useRestorePurchases());

    await act(async () => {
      await result.current.restore();
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.restore();
    });
    expect(result.current.error).toBeNull();
  });
});
