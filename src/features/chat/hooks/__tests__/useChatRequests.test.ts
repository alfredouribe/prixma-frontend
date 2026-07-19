import { renderHook, act } from '@testing-library/react-native';
import { useChatRequests } from '../useChatRequests';
import { chatService } from '../../services/chatService';
import type { Conversation } from '../../types/chat.types';

jest.mock('../../services/chatService');

function buildConversation(): Conversation {
  return {
    id: 'req-1',
    type: 'request',
    status: 'active',
    other_user: { id: 'user-3', display_name: 'Nadia', photo: null, pronouns: [] },
    last_message: null,
    unread_count: 0,
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-19T10:00:00Z',
  };
}

describe('useChatRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('acepta una solicitud y retorna la conversación actualizada', async () => {
    (chatService.acceptRequest as jest.Mock).mockResolvedValue(buildConversation());
    const { result } = renderHook(() => useChatRequests());

    let response: Conversation | null = null;
    await act(async () => {
      response = await result.current.acceptRequest('req-1');
    });

    expect(chatService.acceptRequest).toHaveBeenCalledWith('req-1');
    expect(response).toEqual(buildConversation());
    expect(result.current.error).toBeNull();
  });

  it('setea un error si falla el rechazo de la solicitud', async () => {
    (chatService.rejectRequest as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useChatRequests());

    let response: Conversation | null = buildConversation();
    await act(async () => {
      response = await result.current.rejectRequest('req-1');
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });
});
