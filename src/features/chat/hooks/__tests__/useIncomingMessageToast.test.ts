import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useIncomingMessageToast } from '../useIncomingMessageToast';
import { getEcho } from '../../../../lib/echo';
import { useActiveConversationStore } from '../../../../stores/activeConversationStore';
import type { MessageSentPayload } from '../../types/chat.types';

// Factory explícito (no automock) — mismo criterio que
// useConversation.test.ts/usePresenceChannel.test.ts: un automock cargaría
// el módulo real de `lib/echo.ts`, que hace `import Pusher from
// 'pusher-js/react-native'` y arrastra su dependencia nativa de NetInfo,
// rota en el entorno de test.
jest.mock('../../../../lib/echo', () => ({
  getEcho: jest.fn(),
  disconnectEcho: jest.fn(),
}));

function buildPayload(overrides: Partial<MessageSentPayload> = {}): MessageSentPayload {
  return {
    message: {
      id: 'msg-1',
      sender_id: 'user-2',
      content: 'Hola, ¿cómo estás?',
      read_at: null,
      created_at: '2026-08-02T10:00:00Z',
    },
    conversation_id: 'conv-1',
    sender_name: 'Sam',
    preview: 'Hola, ¿cómo estás?',
    ...overrides,
    sender_photo: overrides.sender_photo ?? null,
  };
}

describe('useIncomingMessageToast', () => {
  const listen = jest.fn();
  const leave = jest.fn();
  const privateChannel = jest.fn(() => ({ listen }));
  const echoMock = { private: privateChannel, leave };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (getEcho as jest.Mock).mockReturnValue(echoMock);
    useActiveConversationStore.setState({ activeConversationId: null });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function emit(payload: MessageSentPayload) {
    const handler = listen.mock.calls.find(([event]) => event === 'MessageSent')?.[1] as (
      payload: MessageSentPayload,
    ) => void;
    act(() => handler(payload));
  }

  it('se suscribe al canal privado del usuario cuando enabled es true y hay userId', () => {
    renderHook(() => useIncomingMessageToast(true, 'user-1'));

    expect(privateChannel).toHaveBeenCalledWith('App.Models.User.user-1');
    expect(listen).toHaveBeenCalledWith('MessageSent', expect.any(Function));
  });

  it('no se suscribe a ningún canal cuando enabled es false', () => {
    renderHook(() => useIncomingMessageToast(false, 'user-1'));

    expect(privateChannel).not.toHaveBeenCalled();
  });

  it('no se suscribe a ningún canal cuando no hay userId', () => {
    renderHook(() => useIncomingMessageToast(true, undefined));

    expect(privateChannel).not.toHaveBeenCalled();
  });

  it('se desuscribe del canal al desmontar', () => {
    const { unmount } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    unmount();

    expect(leave).toHaveBeenCalledWith('App.Models.User.user-1');
  });

  it('expone el toast con sender_name/preview del payload cuando el mensaje es de otra conversación', () => {
    useActiveConversationStore.setState({ activeConversationId: 'conv-abierta' });
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(
      buildPayload({
        conversation_id: 'conv-1',
        sender_name: 'Sam',
        sender_photo: 'https://cdn.example.com/sam.jpg',
        preview: 'Hola de nuevo',
      }),
    );

    expect(result.current.toast).toEqual({
      conversationId: 'conv-1',
      senderName: 'Sam',
      senderPhoto: 'https://cdn.example.com/sam.jpg',
      preview: 'Hola de nuevo',
    });
  });

  it('ignora el evento si el mensaje pertenece a la conversación ya abierta', () => {
    useActiveConversationStore.setState({ activeConversationId: 'conv-1' });
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload({ conversation_id: 'conv-1' }));

    expect(result.current.toast).toBeNull();
  });

  it('muestra el toast si llega un mensaje de una conversación distinta a la abierta', () => {
    useActiveConversationStore.setState({ activeConversationId: 'conv-2' });
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload({ conversation_id: 'conv-1' }));

    expect(result.current.toast).not.toBeNull();
  });

  it('handlePress navega a la conversación correcta y limpia el toast', () => {
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload({ conversation_id: 'conv-1' }));
    expect(result.current.toast).not.toBeNull();

    act(() => result.current.handlePress());

    expect(router.push).toHaveBeenCalledWith({ pathname: '/(app)/chat/[id]', params: { id: 'conv-1' } });
    expect(result.current.toast).toBeNull();
  });

  it('no navega si handlePress se llama sin un toast activo', () => {
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    act(() => result.current.handlePress());

    expect(router.push).not.toHaveBeenCalled();
  });

  it('se auto-descarta después de unos segundos', () => {
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload());
    expect(result.current.toast).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.toast).toBeNull();
  });

  it('dismiss limpia el toast manualmente', () => {
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload());
    act(() => result.current.dismiss());

    expect(result.current.toast).toBeNull();
  });

  it('un mensaje nuevo mientras el toast anterior sigue visible reemplaza el contenido y reinicia el timer', () => {
    const { result } = renderHook(() => useIncomingMessageToast(true, 'user-1'));

    emit(buildPayload({ conversation_id: 'conv-1', preview: 'Primero' }));
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    emit(buildPayload({ conversation_id: 'conv-2', preview: 'Segundo' }));

    // Si el timer del primer toast no se hubiera cancelado, este avance
    // (3000 + 3000 = 6000ms > 5000ms) habría descartado el toast ya.
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.toast).toEqual({
      conversationId: 'conv-2',
      senderName: 'Sam',
      senderPhoto: null,
      preview: 'Segundo',
    });
  });
});
