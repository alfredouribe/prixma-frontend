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

  it('restaura una compra real: resuelve true, muestra el mensaje de éxito, refresca /premium/settings (best-effort)', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({
      entitlements: { active: { 'Prixma+': {} } },
    });

    const { result } = renderHook(() => useRestorePurchases());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.restore();
    });

    expect(success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.message).toMatch(/encontramos tu compra/i);
    expect(premiumService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('sin nada que restaurar: resuelve false, sin error, pero avisa que no encontró ninguna compra', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({ entitlements: { active: {} } });

    const { result } = renderHook(() => useRestorePurchases());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.restore();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.message).toMatch(/no encontramos ninguna compra/i);
  });

  it('en error, resuelve false y expone un mensaje de error (no el de "sin compras")', async () => {
    (Purchases.restorePurchases as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useRestorePurchases());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.restore();
    });

    expect(success).toBe(false);
    expect(result.current.error).toMatch(/no se pudieron restaurar/i);
    expect(result.current.message).toBeNull();
  });

  it('isRestoring vuelve a false tras completar', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({
      entitlements: { active: { 'Prixma+': {} } },
    });

    const { result } = renderHook(() => useRestorePurchases());

    await act(async () => {
      await result.current.restore();
    });

    expect(result.current.isRestoring).toBe(false);
  });

  it('resetea el error y el mensaje en cada nuevo intento', async () => {
    (Purchases.restorePurchases as jest.Mock)
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ entitlements: { active: { 'Prixma+': {} } } });

    const { result } = renderHook(() => useRestorePurchases());

    await act(async () => {
      await result.current.restore();
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.restore();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.message).toMatch(/encontramos tu compra/i);
  });
});
