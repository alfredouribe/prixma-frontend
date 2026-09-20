import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { useConfigurePurchases } from '../useConfigurePurchases';

const ORIGINAL_PLATFORM_OS = Platform.OS;
const ORIGINAL_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

describe('useConfigurePurchases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = 'test-rc-api-key';
    (Purchases.isConfigured as jest.Mock).mockResolvedValue(false);
  });

  afterAll(() => {
    Platform.OS = ORIGINAL_PLATFORM_OS;
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = ORIGINAL_API_KEY;
  });

  it('configura Purchases con la apiKey y el appUserID cuando no estaba configurado', async () => {
    const { result } = renderHook(() => useConfigurePurchases());

    await result.current.configurePurchases('user-uuid-1');

    expect(Purchases.configure).toHaveBeenCalledWith({
      apiKey: 'test-rc-api-key',
      appUserID: 'user-uuid-1',
    });
  });

  it('no reconfigura si ya está configurado con el mismo appUserID', async () => {
    (Purchases.isConfigured as jest.Mock).mockResolvedValue(true);
    (Purchases.getAppUserID as jest.Mock).mockResolvedValue('user-uuid-1');

    const { result } = renderHook(() => useConfigurePurchases());
    await result.current.configurePurchases('user-uuid-1');

    expect(Purchases.configure).not.toHaveBeenCalled();
  });

  it('reconfigura si ya está configurado pero con un appUserID distinto (cambio de cuenta)', async () => {
    (Purchases.isConfigured as jest.Mock).mockResolvedValue(true);
    (Purchases.getAppUserID as jest.Mock).mockResolvedValue('old-user-uuid');

    const { result } = renderHook(() => useConfigurePurchases());
    await result.current.configurePurchases('new-user-uuid');

    expect(Purchases.configure).toHaveBeenCalledWith({
      apiKey: 'test-rc-api-key',
      appUserID: 'new-user-uuid',
    });
  });

  it('no hace nada en iOS (Android-only esta ronda)', async () => {
    Platform.OS = 'ios';

    const { result } = renderHook(() => useConfigurePurchases());
    await result.current.configurePurchases('user-uuid-1');

    expect(Purchases.isConfigured).not.toHaveBeenCalled();
    expect(Purchases.configure).not.toHaveBeenCalled();
  });

  it('no configura ni lanza si la llave de .env está vacía', async () => {
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = '';

    const { result } = renderHook(() => useConfigurePurchases());

    await expect(result.current.configurePurchases('user-uuid-1')).resolves.toBeUndefined();
    expect(Purchases.configure).not.toHaveBeenCalled();
  });

  it('nunca lanza (best-effort) si Purchases.configure falla', async () => {
    (Purchases.configure as jest.Mock).mockImplementation(() => {
      throw new Error('native module error');
    });

    const { result } = renderHook(() => useConfigurePurchases());

    await expect(result.current.configurePurchases('user-uuid-1')).resolves.toBeUndefined();
  });

  it('nunca lanza (best-effort) si Purchases.isConfigured falla', async () => {
    (Purchases.isConfigured as jest.Mock).mockRejectedValue(new Error('native module error'));

    const { result } = renderHook(() => useConfigurePurchases());

    await expect(result.current.configurePurchases('user-uuid-1')).resolves.toBeUndefined();
    expect(Purchases.configure).not.toHaveBeenCalled();
  });
});
