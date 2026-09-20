import { renderHook, act } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';
import { usePurchasePrixmaPlus } from '../usePurchasePrixmaPlus';
import { premiumService } from '../../../premium/services/premiumService';

jest.mock('../../../premium/services/premiumService');

const monthlyPackage = { identifier: '$rc_monthly' } as never;

describe('usePurchasePrixmaPlus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (premiumService.getSettings as jest.Mock).mockResolvedValue({});
  });

  it('compra exitosa: resuelve true y refresca /premium/settings (best-effort)', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({
      current: { monthly: monthlyPackage },
    });
    (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
      customerInfo: { entitlements: { active: { 'Prixma+': { isActive: true } } } },
    });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.purchase();
    });

    expect(success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(Purchases.purchasePackage).toHaveBeenCalledWith(monthlyPackage);
    expect(premiumService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('sin oferta disponible (offerings.current.monthly es null): resuelve false con mensaje claro, sin intentar comprar', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: { monthly: null } });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.purchase();
    });

    expect(success).toBe(false);
    expect(result.current.error).toMatch(/no está disponible/i);
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();
  });

  it('sin ninguna oferta configurada (offerings.current es null): resuelve false con el mismo mensaje', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: null });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.purchase();
    });

    expect(success).toBe(false);
    expect(result.current.error).toMatch(/no está disponible/i);
  });

  it('el usuario cancela el diálogo de compra: resuelve false, sin mensaje de error', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({
      current: { monthly: monthlyPackage },
    });
    (Purchases.purchasePackage as jest.Mock).mockRejectedValue({ code: '1' });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.purchase();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('un error real de compra (no cancelación): resuelve false con mensaje de error', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({
      current: { monthly: monthlyPackage },
    });
    (Purchases.purchasePackage as jest.Mock).mockRejectedValue({ code: '2', message: 'billing error' });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.purchase();
    });

    expect(success).toBe(false);
    expect(result.current.error).toMatch(/no se pudo completar la compra/i);
  });

  it('resetea el error en cada nuevo intento', async () => {
    (Purchases.getOfferings as jest.Mock)
      .mockResolvedValueOnce({ current: { monthly: null } })
      .mockResolvedValueOnce({ current: { monthly: monthlyPackage } });
    (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
      customerInfo: { entitlements: { active: { 'Prixma+': { isActive: true } } } },
    });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    await act(async () => {
      await result.current.purchase();
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.purchase();
    });
    expect(result.current.error).toBeNull();
  });

  it('isPurchasing vuelve a false tras completar (éxito o error)', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: { monthly: null } });

    const { result } = renderHook(() => usePurchasePrixmaPlus());

    await act(async () => {
      await result.current.purchase();
    });

    expect(result.current.isPurchasing).toBe(false);
  });
});
