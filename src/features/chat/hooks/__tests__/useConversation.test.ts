import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useConversation } from '../useConversation';
import { chatService } from '../../services/chatService';
import { getEcho } from '../../../../lib/echo';
import type { Conversation, MessageSentPayload } from '../../types/chat.types';

jest.mock('../../services/chatService');
// Factory explícito (no automock): automock forzaría a Jest a cargar el
// módulo real para introspectarlo, lo que ejecutaría el `import Pusher from
// 'pusher-js/react-native'` real y su dependencia nativa de NetInfo — rompe
// en el entorno de test (no hay binding nativo). El factory evita tocar el
// archivo real por completo.
jest.mock('../../../../lib/echo', () => ({
  getEcho: jest.fn(),
  disconnectEcho: jest.fn(),
}));

function buildConversation(): Conversation {
  return {
    id: 'conv-1',
    type: 'match',
    status: 'active',
    other_user: { id: 'user-2', display_name: 'Sam', photo: null, pronouns: [] },
    last_message: null,
    unread_count: 0,
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-19T10:00:00Z',
  };
}

describe('useConversation', () => {
  const listen = jest.fn();
  const leave = jest.fn();
  const privateChannel = jest.fn(() => ({ listen }));
  const echoMock = { private: privateChannel, leave };

  beforeEach(() => {
    jest.clearAllMocks();
    (getEcho as jest.Mock).mockReturnValue(echoMock);
    (chatService.getConversation as jest.Mock).mockResolvedValue(buildConversation());
    (chatService.getMessages as jest.Mock).mockResolvedValue({
      messages: [],
      currentPage: 1,
      lastPage: 1,
      total: 0,
    });
    (chatService.markAsRead as jest.Mock).mockResolvedValue(undefined);
  });

  it('se suscribe al canal privado de la conversación al montar', async () => {
    const { result } = renderHook(() => useConversation('conv-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(privateChannel).toHaveBeenCalledWith('conversation.conv-1');
    expect(listen).toHaveBeenCalledWith('MessageSent', expect.any(Function));
  });

  it('agrega un mensaje nuevo al estado cuando llega el evento MessageSent de Reverb', async () => {
    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const handler = listen.mock.calls.find(([event]) => event === 'MessageSent')?.[1] as (
      payload: MessageSentPayload,
    ) => void;

    act(() => {
      handler({
        message: {
          id: 'msg-1',
          sender_id: 'user-2',
          content: 'Hola, ¿cómo estás?',
          read_at: null,
          created_at: '2026-07-19T10:05:00Z',
        },
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hola, ¿cómo estás?');
  });

  it('no duplica un mensaje que ya existe en el estado (mismo id)', async () => {
    (chatService.getMessages as jest.Mock).mockResolvedValue({
      messages: [
        { id: 'msg-1', sender_id: 'user-2', content: 'Hola', read_at: null, created_at: '2026-07-19T10:00:00Z' },
      ],
      currentPage: 1,
      lastPage: 1,
      total: 1,
    });

    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(1);

    const handler = listen.mock.calls.find(([event]) => event === 'MessageSent')?.[1] as (
      payload: MessageSentPayload,
    ) => void;

    act(() => {
      handler({
        message: { id: 'msg-1', sender_id: 'user-2', content: 'Hola', read_at: null, created_at: '2026-07-19T10:00:00Z' },
      });
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it('se desconecta del canal al desmontar', async () => {
    const { result, unmount } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();

    expect(leave).toHaveBeenCalledWith('conversation.conv-1');
  });
});
