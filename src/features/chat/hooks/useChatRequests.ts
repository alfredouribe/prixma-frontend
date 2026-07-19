import { useState } from 'react';
import { chatService } from '../services/chatService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Conversation } from '../types/chat.types';

export function useChatRequests() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function acceptRequest(conversationId: string): Promise<Conversation | null> {
    setProcessingId(conversationId);
    setError(null);
    try {
      const conversation = await chatService.acceptRequest(conversationId);
      return conversation;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return null;
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectRequest(conversationId: string): Promise<Conversation | null> {
    setProcessingId(conversationId);
    setError(null);
    try {
      const conversation = await chatService.rejectRequest(conversationId);
      return conversation;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return null;
    } finally {
      setProcessingId(null);
    }
  }

  return { acceptRequest, rejectRequest, processingId, error };
}
