import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRegisterPushToken } from '../useRegisterPushToken';
import { notificationService } from '../../services/notificationService';

jest.mock('expo-notifications');
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'test-project-id' } } } },
}));
jest.mock('../../services/notificationService');

const expectedPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

describe('useRegisterPushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra el token de Expo del dispositivo cuando el permiso ya estaba concedido', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[abc]',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'test-project-id' });
    expect(notificationService.registerDeviceToken).toHaveBeenCalledWith(
      'ExponentPushToken[abc]',
      expectedPlatform,
    );
  });

  it('pide permiso solo cuando el estado es undetermined, y registra si se concede', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[xyz]',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(notificationService.registerDeviceToken).toHaveBeenCalledWith(
      'ExponentPushToken[xyz]',
      expectedPlatform,
    );
  });

  it('no vuelve a pedir permiso si el usuario ya lo había negado (denied)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('no registra el token si tras pedir permiso el usuario lo niega', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('usa getExpoPushTokenAsync (token de Expo), nunca getDevicePushTokenAsync', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[abc]',
    });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getDevicePushTokenAsync).not.toHaveBeenCalled();
  });

  it('no registra nada si no hay projectId configurado en app.json', async () => {
    (Constants as unknown as { expoConfig: unknown }).expoConfig = { extra: { eas: {} } };
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useRegisterPushToken());
    await result.current.registerPushToken();

    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();

    (Constants as unknown as { expoConfig: unknown }).expoConfig = {
      extra: { eas: { projectId: 'test-project-id' } },
    };
  });

  it('nunca lanza (best-effort) si getExpoPushTokenAsync falla', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(new Error('native module error'));

    const { result } = renderHook(() => useRegisterPushToken());

    await expect(result.current.registerPushToken()).resolves.toBeUndefined();
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('nunca lanza (best-effort) si registerDeviceToken falla en el backend', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[abc]',
    });
    (notificationService.registerDeviceToken as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useRegisterPushToken());

    await expect(result.current.registerPushToken()).resolves.toBeUndefined();
  });
});
