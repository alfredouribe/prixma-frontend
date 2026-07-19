import { renderHook, act } from '@testing-library/react-native';
import { useSendMessage } from '../useSendMessage';
import { chatService } from '../../../chat/services/chatService';
import { router } from 'expo-router';
import type { Conversation } from '../../../chat/types/chat.types';

jest.mock('../../../chat/services/chatService');

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

describe('useSendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navega a la conversación existente y retorna "found"', async () => {
    (chatService.getConversationWithUser as jest.Mock).mockResolvedValue(buildConversation());
    const { result } = renderHook(() => useSendMessage());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.openConversationOrRequest('user-2');
    });

    expect(outcome).toBe('found');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-1' },
    });
  });

  it('retorna "not_found" y no navega si no existe conversación', async () => {
    (chatService.getConversationWithUser as jest.Mock).mockResolvedValue(null);
    const { result } = renderHook(() => useSendMessage());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.openConversationOrRequest('user-2');
    });

    expect(outcome).toBe('not_found');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('retorna "error" y setea `error` si la búsqueda falla por una razón distinta a 404', async () => {
    (chatService.getConversationWithUser as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useSendMessage());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.openConversationOrRequest('user-2');
    });

    expect(outcome).toBe('error');
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('sendRequestAndOpen crea la solicitud y navega a la conversación creada', async () => {
    (chatService.sendRequest as jest.Mock).mockResolvedValue(buildConversation());
    const { result } = renderHook(() => useSendMessage());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.sendRequestAndOpen('user-2', 'Hola');
    });

    expect(ok).toBe(true);
    expect(chatService.sendRequest).toHaveBeenCalledWith({ receiver_id: 'user-2', content: 'Hola' });
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-1' },
    });
  });
});
