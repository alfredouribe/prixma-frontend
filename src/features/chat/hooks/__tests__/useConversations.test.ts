import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useConversations } from '../useConversations';
import { chatService } from '../../services/chatService';
import type { Conversation } from '../../types/chat.types';

jest.mock('../../services/chatService');

// Simula el cambio de AppState que el mock de react-native de jest-expo no
// dispara por sí solo — captura el listener real registrado por el hook
// para invocarlo manualmente, mismo patrón que otros tests de este
// proyecto usan para listeners de Echo/notificaciones.
function emitAppStateChange(nextState: 'active' | 'background' | 'inactive') {
  const addEventListenerMock = AppState.addEventListener as jest.Mock;
  const handler = addEventListenerMock.mock.calls[addEventListenerMock.mock.calls.length - 1][1];
  act(() => {
    handler(nextState);
  });
}

function buildConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    type: 'match',
    status: 'active',
    other_user: { id: 'user-2', display_name: 'Sam', photo: null, pronouns: [] },
    last_message: null,
    unread_count: 0,
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-19T10:00:00Z',
    ...overrides,
  };
}

describe('useConversations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('separa matches y solicitudes tras cargar la bandeja', async () => {
    (chatService.getConversations as jest.Mock).mockResolvedValue({
      matches: [buildConversation()],
      requests: [buildConversation({ id: 'req-1', type: 'request', status: 'pending' })],
    });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.matches).toHaveLength(1);
    expect(result.current.requests).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('setea un mensaje de error si falla la carga', async () => {
    (chatService.getConversations as jest.Mock).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useConversations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(result.current.matches).toEqual([]);
  });

  it('bug real 2026-10-02: vuelve a cargar la bandeja cuando la app regresa a primer plano, sin cambiar de pantalla', async () => {
    (chatService.getConversations as jest.Mock)
      .mockResolvedValueOnce({ matches: [buildConversation()], requests: [] })
      .mockResolvedValueOnce({
        matches: [buildConversation(), buildConversation({ id: 'conv-2' })],
        requests: [],
      });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toHaveLength(1);

    emitAppStateChange('active');

    await waitFor(() => expect(result.current.matches).toHaveLength(2));
    expect(chatService.getConversations).toHaveBeenCalledTimes(2);
  });

  it('no recarga cuando la app pasa a segundo plano, solo al volver a activa', async () => {
    (chatService.getConversations as jest.Mock).mockResolvedValue({ matches: [], requests: [] });

    renderHook(() => useConversations());
    await waitFor(() => expect(chatService.getConversations).toHaveBeenCalledTimes(1));

    emitAppStateChange('background');

    expect(chatService.getConversations).toHaveBeenCalledTimes(1);
  });
});
