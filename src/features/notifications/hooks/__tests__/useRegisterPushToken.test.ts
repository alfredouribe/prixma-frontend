import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRegisterPushToken } from '../useRegisterPushToken';
import { notificationService } from '../../services/notificationService';

jest.mock('expo-notifications');
jest.mock('../../services/notificationService');

const expectedPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

describe('useRegisterPushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra el token del dispositivo cuando el permiso ya estaba concedido', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
      type: expectedPlatform,
      data: 'native-token-abc',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(notificationService.registerDeviceToken).toHaveBeenCalledWith('native-token-abc', expectedPlatform);
  });

  it('pide permiso solo cuando el estado es undetermined, y registra si se concede', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
      type: expectedPlatform,
      data: 'native-token-xyz',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(notificationService.registerDeviceToken).toHaveBeenCalledWith('native-token-xyz', expectedPlatform);
  });

  it('no vuelve a pedir permiso si el usuario ya lo había negado (denied)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.getDevicePushTokenAsync).not.toHaveBeenCalled();
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('no registra el token si tras pedir permiso el usuario lo niega', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('usa getDevicePushTokenAsync (token nativo), nunca getExpoPushTokenAsync', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
      type: expectedPlatform,
      data: 'native-token-abc',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.getDevicePushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('nunca lanza (best-effort) si getDevicePushTokenAsync falla', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockRejectedValue(new Error('native module error'));

    const { result } = renderHook(() => useRegisterPushToken());

    await expect(result.current.registerPushToken()).resolves.toBeUndefined();
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('nunca lanza (best-effort) si registerDeviceToken falla en el backend', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
      type: expectedPlatform,
      data: 'native-token-abc',
    });
    (notificationService.registerDeviceToken as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useRegisterPushToken());

    await expect(result.current.registerPushToken()).resolves.toBeUndefined();
  });
});
