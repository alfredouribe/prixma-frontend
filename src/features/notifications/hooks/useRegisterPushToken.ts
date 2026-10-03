import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import type { DevicePlatform } from '../types/notification.types';

/**
 * Pide permiso de notificaciones push (solo si el usuario todavía no lo ha
 * respondido — `getPermissionsAsync()` primero, nunca vuelve a pedirlo si
 * ya quedó en `denied`) y, si se concede, registra el token de Expo del
 * dispositivo en el backend (`POST /notifications/device-token`).
 *
 * Migrado 2026-10-01 de `getDevicePushTokenAsync()` (token nativo crudo de
 * FCM/APNs) a `getExpoPushTokenAsync()` — el backend (`ExpoPushService`)
 * ahora envía a través de la API pública de Expo en vez de hablar directo
 * con Firebase, así que el token que hay que guardar es el de Expo
 * (`ExponentPushToken[...]`), no el nativo. Ver
 * features/notifications/specs/plan.md → "Migración a Expo Push Service".
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

      // `projectId` explícito en vez de dejar que expo-notifications lo
      // adivine — mismo valor que ya usa EAS Build (`app.json` →
      // `extra.eas.projectId`), necesario para que el token de Expo quede
      // asociado al proyecto correcto.
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (typeof projectId !== 'string') {
        return;
      }

      const expoPushToken = await Notifications.getExpoPushTokenAsync({ projectId });

      const platform: DevicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';
      await notificationService.registerDeviceToken(expoPushToken.data, platform);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('useRegisterPushToken: no se pudo registrar el token de notificaciones push.', error);
    }
  }

  return { registerPushToken };
}
