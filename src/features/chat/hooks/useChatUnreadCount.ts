import { useCallback, useEffect, useState } from 'react';
import { chatService } from '../services/chatService';

// Mismo patrón que features/notifications/hooks/useUnreadCount.ts (polling,
// sin canal dedicado al conteo agregado — el canal de Reverb existente solo
// transporta mensajes individuales, no un total). Usado por el badge
// numérico del ícono de Chats en la barra de tabs.
const POLL_INTERVAL_MS = 30_000;

export function useChatUnreadCount() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const value = await chatService.getUnreadCount();
      setCount(value);
    } catch {
      // Silencioso: el badge simplemente no se actualiza en este ciclo de
      // polling, no bloquea el resto de la pantalla que lo usa.
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  return { count, refresh: load };
}
