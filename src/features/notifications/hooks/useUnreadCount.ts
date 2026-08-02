import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

// plan.md → "Badge count": "se actualiza vía WebSocket ... o polling cada
// 30 segundos si no hay WebSocket disponible". No hay canal dedicado al
// conteo (solo el canal de presencia `online`, que no transporta el
// badge) — se implementa polling.
const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const value = await notificationService.getUnreadCount();
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
