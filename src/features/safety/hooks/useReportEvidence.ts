import { useEffect, useState } from 'react';
import { profileService } from '../../profile/services/profileService';
import { chatService } from '../../chat/services/chatService';
import type { PublicProfile } from '../../profile/types/profile.types';
import type { Message } from '../../chat/types/chat.types';

// Mismo tope que el backend adjunta como evidencia automática
// (ver features/safety/specs/spec.md → "Reporte con bloqueo automático").
const CHAT_EVIDENCE_LIMIT = 20;
const CHAT_PREVIEW_COUNT = 3;

interface ReportEvidence {
  profile: PublicProfile | null;
  chatMessages: Message[];
  /** Total de mensajes en la conversación (no acotado a 20). `null` si no hay conversación. */
  chatTotal: number | null;
  isLoading: boolean;
}

/**
 * Carga el preview de "evidencia adjunta automáticamente" que se muestra en
 * `ReportModal` — solo informativo, nunca bloquea el envío del reporte. Cada
 * pieza (perfil, chat) falla en silencio de forma independiente: si una
 * falla, la otra puede seguir mostrándose.
 *
 * Solo carga mientras `active` es true (el modal está visible) para no
 * disparar requests innecesarios mientras el modal permanece cerrado.
 */
export function useReportEvidence(targetId: string, active: boolean): ReportEvidence {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatTotal, setChatTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!active || !targetId) return;

    let cancelled = false;
    setIsLoading(true);
    setProfile(null);
    setChatMessages([]);
    setChatTotal(null);

    async function loadProfile() {
      try {
        const publicProfile = await profileService.getPublicProfile(targetId);
        if (!cancelled) setProfile(publicProfile);
      } catch {
        // Preview informativo — un fallo aquí no debe bloquear el formulario.
      }
    }

    async function loadChat() {
      try {
        const conversation = await chatService.getConversationWithUser(targetId);
        if (!conversation) return;
        const page = await chatService.getMessages(conversation.id, 1);
        if (cancelled) return;
        // `page.messages` viene `created_at desc` (más reciente primero);
        // se toman los últimos N y se invierten para leer en orden cronológico.
        setChatMessages([...page.messages].slice(0, CHAT_PREVIEW_COUNT).reverse());
        setChatTotal(page.total);
      } catch {
        // Igual que el perfil: informativo, falla en silencio.
      }
    }

    Promise.all([loadProfile(), loadChat()]).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [targetId, active]);

  return { profile, chatMessages, chatTotal, isLoading };
}

export { CHAT_EVIDENCE_LIMIT };
