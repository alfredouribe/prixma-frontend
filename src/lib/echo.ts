import Echo from 'laravel-echo';
import PusherModule from 'pusher-js/react-native';
import type { ChannelAuthorizationCallback } from 'pusher-js';
import api from './api';

// pusher-js/react-native NO expone la clase como default export en runtime —
// su bundle compilado hace `module.exports.Pusher = ...` (named export), pero
// sus tipos (`index.d.ts`) sí declaran un default export (inconsistencia del
// propio paquete, versión 8.5.0). Un `import Pusher from 'pusher-js/react-native'`
// usado directamente como constructor falla con
// "TypeError: constructor is not callable" (Babel interop hace que el
// "default" sea el objeto contenedor completo, no la clase). Se importa el
// módulo completo y se extrae `.Pusher` en runtime, con un cast que preserva
// el tipo real de la clase (sin `any`) para que siga siendo compatible con
// `Echo`'s `Pusher?: typeof Pusher` option.
const Pusher = (PusherModule as unknown as { Pusher: typeof PusherModule }).Pusher;

/**
 * Cliente WebSocket de Laravel Reverb (protocolo Pusher). Instancia única
 * (singleton) reutilizada por todos los hooks que necesitan tiempo real
 * (hoy solo `useConversation`, feature Chat).
 *
 * Autenticación de canales privados: en vez de dejar que Echo/Pusher hagan
 * su propio fetch al `authEndpoint` por defecto (`/broadcasting/auth`, sin
 * el token Sanctum), se provee un `authorizer` custom que reusa el cliente
 * Axios central (`src/lib/api.ts`) — su interceptor de request ya adjunta
 * el Bearer token leído de `expo-secure-store`, así que no se duplica esa
 * lógica aquí. Ver features/chat/specs/plan.md → "WebSocket (useConversation)".
 */

const REVERB_APP_KEY = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? '';
const REVERB_HOST = process.env.EXPO_PUBLIC_REVERB_HOST ?? 'localhost';
const REVERB_PORT = Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? '8080');
const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'http';

interface BroadcastAuthResponse {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
}

let echoInstance: Echo<'reverb'> | null = null;

export function getEcho(): Echo<'reverb'> {
  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo<'reverb'>({
    broadcaster: 'reverb',
    key: REVERB_APP_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    Pusher,
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        api
          .post<BroadcastAuthResponse>('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(null, response.data))
          .catch((error: Error) => callback(error, null));
      },
    }),
  });

  return echoInstance;
}

/**
 * Desconecta y limpia la instancia singleton. Se usa en tests y podría
 * usarse en un futuro flujo de logout explícito.
 */
export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
