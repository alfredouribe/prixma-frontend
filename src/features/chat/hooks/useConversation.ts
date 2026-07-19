import { useCallback, useEffect, useState } from 'react';
import { getEcho } from '../../../lib/echo';
import { chatService } from '../services/chatService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Conversation, Message, MessageSentPayload } from '../types/chat.types';

/**
 * Carga el historial de una conversación (REST) y se conecta al canal
 * privado de Reverb `conversation.{id}` para recibir mensajes nuevos en
 * tiempo real. Ver features/chat/specs/plan.md → "WebSocket (useConversation)".
 */
export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // 1. Historial vía REST + marcar como leído al entrar.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([chatService.getConversation(conversationId), chatService.getMessages(conversationId, 1)])
      .then(([conversationData, messagesPage]) => {
        if (cancelled) return;
        setConversation(conversationData);
        // El backend devuelve orden `created_at desc` (más reciente primero);
        // se invierte para pintar la lista en orden cronológico ascendente.
        setMessages([...messagesPage.messages].reverse());
        setPage(messagesPage.currentPage);
        setLastPage(messagesPage.lastPage);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    chatService.markAsRead(conversationId).catch(() => {
      // No bloquea la carga de la conversación si falla el marcado de leídos.
    });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // 2. Canal privado de Reverb — append en tiempo real, desconecta al desmontar.
  useEffect(() => {
    const channelName = `conversation.${conversationId}`;
    const echo = getEcho();
    const channel = echo.private(channelName);

    channel.listen('MessageSent', (payload: MessageSentPayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
    });

    return () => {
      echo.leave(channelName);
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      setIsSending(true);
      setError(null);
      try {
        const message = await chatService.sendMessage(conversationId, content);
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      } catch (err) {
        setError(extractApiError(err, 'No se pudo enviar el mensaje. Intenta de nuevo.'));
      } finally {
        setIsSending(false);
      }
    },
    [conversationId],
  );

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingMore || page >= lastPage) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const messagesPage = await chatService.getMessages(conversationId, nextPage);
      setMessages((prev) => [...messagesPage.messages].reverse().concat(prev));
      setPage(messagesPage.currentPage);
      setLastPage(messagesPage.lastPage);
    } catch {
      // Falla silenciosa: no bloquea la conversación ya cargada.
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, page, lastPage]);

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    isLoadingMore,
    hasMoreMessages: page < lastPage,
    error,
    sendMessage,
    loadOlderMessages,
  };
}
