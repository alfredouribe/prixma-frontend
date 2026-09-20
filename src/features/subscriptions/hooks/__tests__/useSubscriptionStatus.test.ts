import { renderHook, waitFor, act } from '@testing-library/react-native';
import Purchases from 'react-native-purchases';
import { useSubscriptionStatus } from '../useSubscriptionStatus';

function customerInfoWith(entitlement: unknown, managementURL: string | null = null) {
  return {
    entitlements: { all: entitlement ? { 'Prixma+': entitlement } : {} },
    managementURL,
  };
}

describe('useSubscriptionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('never_subscribed cuando el entitlement Prixma+ nunca existió', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(customerInfoWith(null));

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('never_subscribed');
    expect(result.current.expirationDate).toBeNull();
    expect(result.current.managementUrl).toBeNull();
  });

  it('active_renewing cuando isActive y willRenew son true, con managementUrl real', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(
      customerInfoWith(
        { isActive: true, willRenew: true, expirationDate: '2026-10-14T00:00:00Z' },
        'https://play.google.com/store/account/subscriptions/detail?real=1',
      ),
    );

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('active_renewing');
    expect(result.current.expirationDate).toBe('2026-10-14T00:00:00Z');
    expect(result.current.managementUrl).toBe(
      'https://play.google.com/store/account/subscriptions/detail?real=1',
    );
  });

  it('active_cancelled cuando isActive es true pero willRenew es false', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(
      customerInfoWith({ isActive: true, willRenew: false, expirationDate: '2026-10-14T00:00:00Z' }),
    );

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('active_cancelled');
  });

  it('usa el fallback de Play Store cuando managementURL viene null pero el entitlement está activo', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(
      customerInfoWith({ isActive: true, willRenew: true, expirationDate: '2026-10-14T00:00:00Z' }, null),
    );

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.managementUrl).toBe('https://play.google.com/store/account/subscriptions');
  });

  it('expired cuando el entitlement existe pero isActive es false', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(
      customerInfoWith({ isActive: false, willRenew: false, expirationDate: '2026-01-01T00:00:00Z' }),
    );

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('expired');
    expect(result.current.expirationDate).toBe('2026-01-01T00:00:00Z');
  });

  it('fail-safe: si RevenueCat falla, cae a never_subscribed sin lanzar', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('not configured'));

    const { result } = renderHook(() => useSubscriptionStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('never_subscribed');
  });

  it('refresh() vuelve a consultar a RevenueCat y actualiza el estado', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(customerInfoWith(null));

    const { result } = renderHook(() => useSubscriptionStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('never_subscribed');

    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce(
      customerInfoWith({ isActive: true, willRenew: true, expirationDate: '2026-10-14T00:00:00Z' }),
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('active_renewing');
  });
});
