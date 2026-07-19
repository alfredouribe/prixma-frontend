import api from '../../../lib/api';
import type {
  Conversation,
  ConversationsInbox,
  Message,
  MessagesPage,
  SendRequestPayload,
} from '../types/chat.types';

interface MessagesMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const chatService = {
  async getConversations(): Promise<ConversationsInbox> {
    const { data } = await api.get<{ data: ConversationsInbox }>('/chat/conversations');
    return data.data;
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const { data } = await api.get<{ data: Conversation }>(`/chat/conversations/${conversationId}`);
    return data.data;
  },

  /**
   * Busca una conversación existente con `otherUserId`. Devuelve `null` si
   * el backend responde 404 (no hay conversación previa) — el llamador
   * (hook de Profile) decide si abre `RequestModal` en ese caso. Cualquier
   * otro error se relanza.
   */
  async getConversationWithUser(otherUserId: string): Promise<Conversation | null> {
    try {
      const { data } = await api.get<{ data: Conversation }>(`/chat/conversations/with/${otherUserId}`);
      return data.data;
    } catch (err) {
      if (isNotFound(err)) {
        return null;
      }
      throw err;
    }
  },

  async getMessages(conversationId: string, page = 1): Promise<MessagesPage> {
    const { data } = await api.get<{ data: Message[]; meta: MessagesMeta }>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { page } },
    );
    return {
      messages: data.data,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      total: data.meta.total,
    };
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data } = await api.post<{ data: Message }>(`/chat/conversations/${conversationId}/messages`, {
      content,
    });
    return data.data;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/read`);
  },

  async sendRequest(payload: SendRequestPayload): Promise<Conversation> {
    const { data } = await api.post<{ data: Conversation }>('/chat/requests', payload);
    return data.data;
  },

  async acceptRequest(conversationId: string): Promise<Conversation> {
    const { data } = await api.patch<{ data: Conversation }>(`/chat/requests/${conversationId}/accept`);
    return data.data;
  },

  async rejectRequest(conversationId: string): Promise<Conversation> {
    const { data } = await api.patch<{ data: Conversation }>(`/chat/requests/${conversationId}/reject`);
    return data.data;
  },
};

function isNotFound(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 404;
}
