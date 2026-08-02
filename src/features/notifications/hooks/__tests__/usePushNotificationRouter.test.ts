import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { usePushNotificationRouter } from '../usePushNotificationRouter';

jest.mock('expo-notifications');

function buildResponse(data: Record<string, unknown>) {
  return {
    notification: { request: { content: { data } } },
  } as unknown as Notifications.NotificationResponse;
}

describe('usePushNotificationRouter', () => {
  const remove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove });
  });

  it('registra el handler de foreground que suprime el banner nativo, sin importar enabled', () => {
    renderHook(() => usePushNotificationRouter(false));

    expect(Notifications.setNotificationHandler).toHaveBeenCalledWith(
      expect.objectContaining({ handleNotification: expect.any(Function) }),
    );
  });

  it('el handler de foreground nunca muestra alerta/sonido/badge', async () => {
    renderHook(() => usePushNotificationRouter(false));

    const { handleNotification } = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0];
    await expect(handleNotification()).resolves.toEqual({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  it('no consulta cold start ni escucha taps mientras enabled es false', () => {
    renderHook(() => usePushNotificationRouter(false));

    expect(Notifications.getLastNotificationResponseAsync).not.toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
  });

  it('navega con replace si la app abrió por cold start desde un push con deep link', async () => {
    (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(
      buildResponse({ type: 'match', conversation_id: 'conv-1' }),
    );

    renderHook(() => usePushNotificationRouter(true));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({ pathname: '/(app)/chat/[id]', params: { id: 'conv-1' } }),
    );
  });

  it('no navega en cold start si no hubo respuesta de notificación previa', async () => {
    renderHook(() => usePushNotificationRouter(true));

    await waitFor(() => expect(Notifications.getLastNotificationResponseAsync).toHaveBeenCalled());
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('navega con push cuando el usuario toca un push con la app en background', () => {
    renderHook(() => usePushNotificationRouter(true));

    const listener = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock.calls[0][0];
    listener(buildResponse({ type: 'super_like' }));

    expect(router.push).toHaveBeenCalledWith('/(app)/(tabs)/explore');
  });

  it('no navega si el payload del tap no trae un type reconocido', () => {
    renderHook(() => usePushNotificationRouter(true));

    const listener = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock.calls[0][0];
    listener(buildResponse({ foo: 'bar' }));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('limpia el listener de respuesta al desmontar', () => {
    const { unmount } = renderHook(() => usePushNotificationRouter(true));

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('empieza a escuchar cuando enabled pasa de false a true', () => {
    const { rerender } = renderHook(({ enabled }) => usePushNotificationRouter(enabled), {
      initialProps: { enabled: false },
    });

    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
  });
});
