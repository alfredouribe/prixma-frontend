import { useState } from 'react';
import { useRouter } from 'expo-router';
import { chatService } from '../../chat/services/chatService';
import { conversationRoute } from '../../chat/utils/conversationRoute';
import { extractApiError } from '../../../lib/extractApiError';

export type ConversationLookupResult = 'found' | 'not_found' | 'error';

/**
 * Lógica del botón "Enviar mensaje" en `PublicProfileScreen` — ver
 * features/chat/specs/tasks.md → sección 15 "Integración con Profile".
 *
 * Resuelve si ya existe una conversación con el perfil visto:
 * - Si existe (200) → navega directo a `ConversationScreen` y retorna `found`.
 * - Si no existe (404) → retorna `not_found`, el llamador debe abrir
 *   `RequestModal`.
 * - Cualquier otro error (red, 500, etc.) → retorna `error`; el llamador NO
 *   debe interpretarlo como "no hay conversación" (evita abrir el modal de
 *   solicitud sobre un fallo real de red).
 */
export function useSendMessage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openConversationOrRequest(otherUserId: string): Promise<ConversationLookupResult> {
    setIsChecking(true);
    setError(null);
    try {
      const conversation = await chatService.getConversationWithUser(otherUserId);
      if (conversation) {
        router.push(conversationRoute(conversation.id));
        return 'found';
      }
      return 'not_found';
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return 'error';
    } finally {
      setIsChecking(false);
    }
  }

  async function sendRequestAndOpen(receiverId: string, content: string): Promise<boolean> {
    setIsSendingRequest(true);
    setError(null);
    try {
      const conversation = await chatService.sendRequest({ receiver_id: receiverId, content });
      router.push(conversationRoute(conversation.id));
      return true;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return false;
    } finally {
      setIsSendingRequest(false);
    }
  }

  return { openConversationOrRequest, sendRequestAndOpen, isChecking, isSendingRequest, error };
}
