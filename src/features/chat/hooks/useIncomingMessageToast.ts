import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { getEcho } from '../../../lib/echo';
import { useActiveConversationStore } from '../../../stores/activeConversationStore';
import { conversationRoute } from '../utils/conversationRoute';
import type { MessageSentPayload } from '../types/chat.types';

// Design-system.md no define un tiempo estándar de auto-dismiss para toasts
// (no existía este patrón antes en el proyecto) — 5s sigue el estándar de
// facto de toasts tipo iOS/Android (suficiente para leer un preview de 2
// líneas sin bloquear la pantalla).
const TOAST_DURATION_MS = 5000;

export interface IncomingMessageToast {
  conversationId: string;
  senderName: string;
  senderPhoto: string | null;
  preview: string;
}

/**
 * Listener global (montado una sola vez, no por pantalla) del canal privado
 * `App.Models.User.{miId}` — recibe el mismo evento `MessageSent` que
 * `useConversation` escucha en `conversation.{id}`, pero este canal llega
 * sin importar qué pantalla esté abierta. Ver
 * features/chat/specs/plan.md → "Toast in-app de mensaje nuevo".
 *
 * Ignora el evento si el mensaje pertenece a la conversación que ya está
 * abierta en este momento (`useActiveConversationStore`) — ese caso ya se
 * ve aparecer en el hilo en tiempo real vía `useConversation`, mostrar el
 * toast además sería redundante (decisión confirmada con el humano).
 */
export function useIncomingMessageToast(enabled: boolean, userId: string | null | undefined) {
  const router = useRouter();
  const [toast, setToast] = useState<IncomingMessageToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  useEffect(() => {
    if (!enabled || !userId) return;

    const channelName = `App.Models.User.${userId}`;
    const echo = getEcho();
    const channel = echo.private(channelName);

    channel.listen('MessageSent', (payload: MessageSentPayload) => {
      const { activeConversationId } = useActiveConversationStore.getState();
      if (payload.conversation_id === activeConversationId) {
        return;
      }

      clearTimer();
      setToast({
        conversationId: payload.conversation_id,
        senderName: payload.sender_name,
        senderPhoto: payload.sender_photo,
        preview: payload.preview,
      });
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setToast(null);
      }, TOAST_DURATION_MS);
    });

    return () => {
      echo.leave(channelName);
      clearTimer();
    };
  }, [enabled, userId, clearTimer]);

  const handlePress = useCallback(() => {
    if (!toast) return;
    const { conversationId } = toast;
    dismiss();
    router.push(conversationRoute(conversationId));
  }, [toast, dismiss, router]);

  return { toast, dismiss, handlePress };
}
