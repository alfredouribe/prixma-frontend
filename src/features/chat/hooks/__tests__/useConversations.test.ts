import { renderHook, waitFor } from '@testing-library/react-native';
import { useConversations } from '../useConversations';
import { chatService } from '../../services/chatService';
import type { Conversation } from '../../types/chat.types';

jest.mock('../../services/chatService');

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
});
