import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types/notification.types';

jest.mock('../../services/notificationService');

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'match',
    title: '¡Es un match! 🌟',
    body: 'Tú y Sam se gustaron mutuamente.',
    data: { conversation_id: 'conv-1' },
    read_at: null,
    created_at: '2026-07-26T10:00:00Z',
    ...overrides,
  };
}

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (notificationService.markAllRead as jest.Mock).mockResolvedValue(undefined);
  });

  it('carga la lista de notificaciones', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      notifications: [buildNotification()],
      meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('marca todas como leídas automáticamente cuando hay notificaciones no leídas', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      notifications: [buildNotification({ read_at: null })],
      meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(notificationService.markAllRead).toHaveBeenCalledTimes(1);
    expect(result.current.notifications[0].read_at).not.toBeNull();
  });

  it('no llama a markAllRead si ya no hay notificaciones no leídas', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      notifications: [buildNotification({ read_at: '2026-07-26T09:00:00Z' })],
      meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(notificationService.markAllRead).not.toHaveBeenCalled();
  });

  it('setea un mensaje de error si falla la carga', async () => {
    (notificationService.getNotifications as jest.Mock).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(result.current.notifications).toEqual([]);
  });

  it('markRead actualiza la notificación puntual en el estado', async () => {
    const unread = buildNotification({ read_at: null });
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      notifications: [unread],
      meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
    });
    const readNotification = buildNotification({ read_at: '2026-07-26T10:05:00Z' });
    (notificationService.markRead as jest.Mock).mockResolvedValue(readNotification);

    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.markRead('notif-1');
    });

    expect(result.current.notifications[0].read_at).toBe('2026-07-26T10:05:00Z');
  });
});
