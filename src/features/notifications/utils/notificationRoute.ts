import type { Notification } from '../types/notification.types';

// Deep link map — spec.md → "Tipos de notificaciones" columna "Deep link".
// `match`/`message`/`request_accepted` abren la conversación asociada
// (`data.conversation_id`, mismo shape de ruta que
// `features/chat/utils/conversationRoute.ts`). `super_like` abre Explorar
// — nunca revela quién dio el super like (spec.md → Constraints), así que
// no hay id que llevar en la ruta.
//
// Devuelve `null` si el tipo no tiene deep link resoluble (p. ej. un
// `message`/`match`/`request_accepted` sin `conversation_id` en `data` —
// no debería pasar según el contrato del backend, pero se maneja sin
// reventar la navegación).
//
// El parámetro solo pide `type`/`data` (no la `Notification` completa) a
// propósito: un push crudo de `usePushNotificationRouter.ts` nunca trae
// id/title/body/read_at/created_at, solo lo que hace falta para resolver
// el deep link — ver `pushNotificationPayload.ts` → `pushDataToRoute()`.
export function notificationRoute(notification: Pick<Notification, 'type' | 'data'>) {
  switch (notification.type) {
    case 'match':
    case 'message':
    case 'request_accepted': {
      const conversationId = notification.data?.conversation_id;
      if (!conversationId) return null;
      return { pathname: '/(app)/chat/[id]' as const, params: { id: conversationId } };
    }
    case 'super_like':
      return '/(app)/(tabs)/explore' as const;
    default:
      return null;
  }
}
