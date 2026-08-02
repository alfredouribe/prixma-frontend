import { useEffect } from 'react';
import { getEcho } from '../../../lib/echo';

// Canal de presencia global `online` (routes/channels.php, sin el prefijo
// `presence-` — Laravel lo agrega/quita al hacer match con lo que el
// cliente manda). Se une una sola vez por sesión autenticada (llamado
// desde app/(app)/_layout.tsx, no por pantalla) para que
// `PresenceService::isUserOnline()` del backend sepa que este usuario
// está conectado — señal que consume `sendMessageNotification` para no
// mandar notificación in-app/push redundante mientras el usuario tiene la
// conversación abierta. Ver plan.md → "Presencia online (2026-07-26)".
//
// Sin UI de "en línea" en esta iteración — solo la señal de sesión.
export function usePresenceChannel(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    getEcho().join('online');

    return () => {
      getEcho().leave('online');
    };
  }, [enabled]);
}
