import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useUnreadCount } from '../useUnreadCount';
import { notificationService } from '../../services/notificationService';

jest.mock('../../services/notificationService');

describe('useUnreadCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (notificationService.getUnreadCount as jest.Mock).mockResolvedValue(3);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('consulta el conteo al montar', async () => {
    renderHook(() => useUnreadCount());

    await waitFor(() => expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(1));
  });

  it('inicia polling cada 30 segundos mientras está montado', async () => {
    renderHook(() => useUnreadCount());

    await waitFor(() => expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(1));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });
    expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });
    expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(3);
  });

  it('detiene el polling al desmontar', async () => {
    const { unmount } = renderHook(() => useUnreadCount());

    await waitFor(() => expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(1));

    unmount();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('actualiza el conteo con el valor devuelto por el servicio', async () => {
    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => expect(result.current.count).toBe(3));
  });
});
