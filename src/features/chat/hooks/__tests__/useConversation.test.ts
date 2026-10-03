import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useConversation } from '../useConversation';
import { chatService } from '../../services/chatService';
import { getEcho } from '../../../../lib/echo';
import { useActiveConversationStore } from '../../../../stores/activeConversationStore';
import type { Conversation, MessageSentPayload, MessagesReadPayload } from '../../types/chat.types';

// Mismo patrón que useConversations.test.ts: captura el listener real de
// AppState registrado por el hook para invocarlo manualmente.
function emitAppStateChange(nextState: 'active' | 'background' | 'inactive') {
  const addEventListenerMock = AppState.addEventListener as jest.Mock;
  const handler = addEventListenerMock.mock.calls[addEventListenerMock.mock.calls.length - 1][1];
  act(() => {
    handler(nextState);
  });
}

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
    useActiveConversationStore.setState({ activeConversationId: null });
  });

  it('marca la conversación como activa al montar y la limpia al desmontar (usada por el toast global)', async () => {
    const { result, unmount } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(useActiveConversationStore.getState().activeConversationId).toBe('conv-1');

    unmount();

    expect(useActiveConversationStore.getState().activeConversationId).toBeNull();
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
        conversation_id: 'conv-1',
        sender_name: 'Sam',
        sender_photo: null,
        preview: 'Hola, ¿cómo estás?',
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hola, ¿cómo estás?');
  });

  it('vuelve a marcar como leída la conversación cuando llega un mensaje en vivo (bug: quedaba "no leída" en la bandeja)', async () => {
    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(chatService.markAsRead).toHaveBeenCalledTimes(1);

    const handler = listen.mock.calls.find(([event]) => event === 'MessageSent')?.[1] as (
      payload: MessageSentPayload,
    ) => void;

    act(() => {
      handler({
        message: {
          id: 'msg-1',
          sender_id: 'user-2',
          content: 'Hola de nuevo',
          read_at: null,
          created_at: '2026-07-19T10:05:00Z',
        },
        conversation_id: 'conv-1',
        sender_name: 'Sam',
        sender_photo: null,
        preview: 'Hola de nuevo',
      });
    });

    expect(chatService.markAsRead).toHaveBeenCalledTimes(2);
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
        conversation_id: 'conv-1',
        sender_name: 'Sam',
        sender_photo: null,
        preview: 'Hola',
      });
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it('bug real 2026-10-02: marca los mensajes como "✓✓ visto" en vivo cuando llega MessagesRead', async () => {
    (chatService.getMessages as jest.Mock).mockResolvedValue({
      messages: [
        { id: 'msg-1', sender_id: 'user-1', content: 'Mío', read_at: null, created_at: '2026-10-02T10:00:00Z' },
      ],
      currentPage: 1,
      lastPage: 1,
      total: 1,
    });

    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages[0].read_at).toBeNull();

    const handler = listen.mock.calls.find(([event]) => event === 'MessagesRead')?.[1] as (
      payload: MessagesReadPayload,
    ) => void;

    act(() => {
      handler({ conversation_id: 'conv-1', read_at: '2026-10-02T10:05:00Z' });
    });

    expect(result.current.messages[0].read_at).toBe('2026-10-02T10:05:00Z');
  });

  it('bug real 2026-10-02: al volver la app a primer plano, recupera mensajes perdidos mientras el socket estaba desconectado', async () => {
    (chatService.getMessages as jest.Mock)
      .mockResolvedValueOnce({
        messages: [
          { id: 'msg-1', sender_id: 'user-2', content: 'Antes de minimizar', read_at: null, created_at: '2026-10-02T10:00:00Z' },
        ],
        currentPage: 1,
        lastPage: 1,
        total: 1,
      })
      .mockResolvedValueOnce({
        messages: [
          { id: 'msg-2', sender_id: 'user-2', content: 'Mientras estaba en segundo plano', read_at: null, created_at: '2026-10-02T10:01:00Z' },
          { id: 'msg-1', sender_id: 'user-2', content: 'Antes de minimizar', read_at: null, created_at: '2026-10-02T10:00:00Z' },
        ],
        currentPage: 1,
        lastPage: 1,
        total: 2,
      });

    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toHaveLength(1);
    expect(chatService.markAsRead).toHaveBeenCalledTimes(1);

    emitAppStateChange('active');

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages.map((m) => m.id)).toEqual(['msg-1', 'msg-2']);
    expect(chatService.markAsRead).toHaveBeenCalledTimes(2);
  });

  it('no vuelve a pedir mensajes cuando la app pasa a segundo plano', async () => {
    const { result } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    emitAppStateChange('background');

    expect(chatService.getMessages).toHaveBeenCalledTimes(1);
  });

  it('se desconecta del canal al desmontar', async () => {
    const { result, unmount } = renderHook(() => useConversation('conv-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();

    expect(leave).toHaveBeenCalledWith('conversation.conv-1');
  });
});
