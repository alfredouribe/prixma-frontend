import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useChatUnreadCount } from '../useChatUnreadCount';
import { chatService } from '../../services/chatService';

jest.mock('../../services/chatService');

describe('useChatUnreadCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (chatService.getUnreadCount as jest.Mock).mockResolvedValue(3);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('consulta el conteo al montar', async () => {
    renderHook(() => useChatUnreadCount());

    await waitFor(() => expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1));
  });

  it('inicia polling cada 30 segundos mientras está montado', async () => {
    renderHook(() => useChatUnreadCount());

    await waitFor(() => expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });
    expect(chatService.getUnreadCount).toHaveBeenCalledTimes(2);
  });

  it('detiene el polling al desmontar', async () => {
    const { unmount } = renderHook(() => useChatUnreadCount());

    await waitFor(() => expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1));

    unmount();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('actualiza el conteo con el valor devuelto por el servicio', async () => {
    const { result } = renderHook(() => useChatUnreadCount());

    await waitFor(() => expect(result.current.count).toBe(3));
  });

  it('silencia errores de red sin romper el hook (badge simplemente no se actualiza)', async () => {
    (chatService.getUnreadCount as jest.Mock).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useChatUnreadCount());

    await waitFor(() => expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1));
    expect(result.current.count).toBe(0);
  });
});
