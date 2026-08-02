import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { pushDataToRoute } from '../utils/pushNotificationPayload';

/**
 * Navega al deep link correspondiente cuando el usuario interactúa con un
 * push, y suprime el banner nativo del sistema mientras la app está en
 * foreground.
 *
 * - **Foreground** (`setNotificationHandler`): nunca se muestra la alerta
 *   nativa — spec.md → Constraints: "Cuando la app está en foreground,
 *   mostrar notificación in-app (no push del sistema)". Interpretación,
 *   sin diseño/copy aprobado para un toast propio en brand/copies.md: la
 *   app ya tiene su propio badge/inbox in-app (`useUnreadCount`, polling
 *   cada 30s, + `NotificationsScreen`) que refleja la actividad sin
 *   depender de un banner del SO — "in-app" se resuelve dejando que el
 *   badge haga ese trabajo, no inventando UI de toast nueva.
 * - **Background → tap** (`addNotificationResponseReceivedListener`): el
 *   usuario ya estaba en la app (aunque backgrounded), así que se navega
 *   con `router.push` — igual que `NotificationItem.tsx` al tocar una
 *   notificación desde la bandeja in-app.
 * - **Cold start** (`getLastNotificationResponseAsync`): la app se abrió
 *   desde cero por el tap — se usa `router.replace` porque no hay una
 *   pantalla anterior real a la que volver. Si el usuario no está
 *   autenticado en este punto (sesión expirada), el guard de
 *   `app/(app)/_layout.tsx` ya redirige a `(auth)`; no se implementa
 *   "recordar el deep link y navegar ahí después del login" — spec.md lo
 *   trata como posible, no como requisito.
 *
 * `enabled` debe pasarse en `false` hasta que la navegación raíz esté
 * lista (fuentes cargadas + sesión restaurada) — mismo patrón que
 * `usePresenceChannel(enabled)` — para no navegar antes de que el `<Stack>`
 * raíz esté montado.
 */
export function usePushNotificationRouter(enabled: boolean): void {
  const router = useRouter();

  // Se registra una sola vez, independiente de `enabled` — decide cómo se
  // comporta cualquier push que llegue mientras la app está corriendo, sin
  // importar si la navegación raíz ya terminó de montar.
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!isMounted || !response) return;
        const route = pushDataToRoute(response.notification.request.content.data);
        if (route) router.replace(route);
      })
      .catch(() => {
        // Best-effort — nunca debe reventar el arranque de la app.
      });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = pushDataToRoute(response.notification.request.content.data);
      if (route) router.push(route);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [enabled, router]);
}
