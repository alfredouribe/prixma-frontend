import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import type { DevicePlatform } from '../types/notification.types';

/**
 * Pide permiso de notificaciones push (solo si el usuario todavía no lo ha
 * respondido — `getPermissionsAsync()` primero, nunca vuelve a pedirlo si
 * ya quedó en `denied`) y, si se concede, registra el token nativo del
 * dispositivo en el backend (`POST /notifications/device-token`).
 *
 * IMPORTANTE — usa `getDevicePushTokenAsync()` (token nativo crudo de
 * FCM/APNs), nunca `getExpoPushTokenAsync()`: `device_tokens`/`FcmService`
 * (backend) están diseñados para enviar directo a FCM, no a través del
 * relay de Expo — un Expo push token (`ExponentPushToken[...]`) ahí sería
 * inútil en cuanto exista envío real. Ver
 * features/notifications/specs/plan.md → "Push notifications".
 *
 * Best-effort por diseño: cualquier error (permiso denegado, sin conexión,
 * módulo nativo no disponible, etc.) se traga aquí — nunca debe bloquear
 * ni fallar el login que la invoca (ver `useLogin.ts`).
 */
export function useRegisterPushToken() {
  async function registerPushToken(): Promise<void> {
    try {
      let { status } = await Notifications.getPermissionsAsync();

      if (status === 'undetermined') {
        ({ status } = await Notifications.requestPermissionsAsync());
      }

      if (status !== 'granted') {
        return;
      }

      const devicePushToken = await Notifications.getDevicePushTokenAsync();

      // `data` es un `string` en iOS/Android (el shape real que nos
      // interesa). El otro miembro de la unión de tipos de expo-notifications
      // (`WebDevicePushToken`, un objeto de suscripción) es exclusivo de web,
      // que esta app no soporta — se descarta explícitamente en vez de
      // castear, así nunca se filtra un valor no-string al backend.
      if (typeof devicePushToken.data !== 'string') {
        return;
      }

      const platform: DevicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';
      await notificationService.registerDeviceToken(devicePushToken.data, platform);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('useRegisterPushToken: no se pudo registrar el token de notificaciones push.', error);
    }
  }

  return { registerPushToken };
}
