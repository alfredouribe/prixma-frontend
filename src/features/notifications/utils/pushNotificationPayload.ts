import { notificationRoute } from './notificationRoute';
import type { NotificationType } from '../types/notification.types';

const NOTIFICATION_TYPES: readonly NotificationType[] = ['match', 'message', 'super_like', 'request_accepted'];

function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

/**
 * Adapta el payload `data` de un push real (shape confirmado contra
 * backend/app/Jobs/Send{Match,Message,SuperLike}Notification.php:
 * `$payload['data']` es `{ conversation_id?: string, type: NotificationType }`
 * en el nivel superior, sin anidar bajo otra clave `data`) a la forma
 * mínima que espera `notificationRoute()`.
 *
 * Un push nunca trae un `Notification` completo (sin id/title/body/
 * read_at/created_at, esos solo existen en el registro de BD que consulta
 * `NotificationsScreen`), así que no se puede reusar `notificationRoute()`
 * pasándole el payload tal cual — de ahí este adaptador.
 *
 * Devuelve `null` si el payload no trae un `type` reconocido (nunca revienta
 * la navegación por un push con forma inesperada).
 */
export function pushDataToRoute(
  data: Record<string, unknown> | undefined | null,
): ReturnType<typeof notificationRoute> {
  if (!data || !isNotificationType(data.type)) {
    return null;
  }

  const conversationId = typeof data.conversation_id === 'string' ? data.conversation_id : undefined;

  return notificationRoute({
    type: data.type,
    data: conversationId ? { conversation_id: conversationId } : null,
  });
}
