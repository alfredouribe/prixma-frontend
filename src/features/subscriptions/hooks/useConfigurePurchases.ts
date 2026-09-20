import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

/**
 * Configura el SDK de RevenueCat (`Purchases.configure()`) con el usuario
 * autenticado actual — necesario antes de poder usar cualquier otra función
 * de Purchases (`getOfferings`/`purchasePackage`/`getCustomerInfo`/etc.).
 *
 * `appUserID` debe ser exactamente `user.id` (el UUID real de `users`,
 * mismo valor que expone `GET /auth/me`) porque el webhook del backend
 * (`SubscriptionService::handleRevenueCatEvent()`) identifica al usuario
 * haciendo `User::findOrFail($appUserId)` con ese mismo valor — ver
 * features/subscriptions/specs/plan.md → "Webhook de RevenueCat".
 *
 * Se llama desde DOS lugares (ver features/subscriptions/specs/plan.md →
 * "Dónde vive Purchases.configure()" para la decisión completa y su
 * justificación):
 * - `useLogin.ts`, tras un login interactivo exitoso.
 * - El `bootstrap()` de `app/_layout.tsx`, en cada apertura de la app con
 *   sesión ya iniciada (el caso más común de uso real) — sin este segundo
 *   punto, cualquier usuario que reabra la app con sesión ya iniciada nunca
 *   tendría el SDK configurado, y el paywall/restaurar compras/Mi
 *   suscripción fallarían para el caso más común, no solo para el login
 *   interactivo.
 *
 * Android-only (iOS pospuesto, ver spec.md → "Fuera de alcance"),
 * best-effort — nunca bloquea login/bootstrap, nunca lanza si `configure()`
 * falla o si la llave todavía no está configurada en `.env` (mismo patrón
 * ya usado en `useRegisterPushToken.ts` para permisos denegados) — y segura
 * de llamar más de una vez: si ya está configurado con el mismo `appUserID`
 * no hace nada; si está configurado con uno distinto (cambio de cuenta en el
 * mismo dispositivo sin pasar por `Purchases.logOut()`, que este proyecto no
 * llama todavía al cerrar sesión — gap conocido, documentado en plan.md, no
 * corregido en esta ronda) se reconfigura para el usuario nuevo.
 */
export function useConfigurePurchases() {
  async function configurePurchases(userId: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    // Leído en cada llamada (no como constante de módulo) para que el valor
    // real de `.env` — cargado por Expo al arrancar el bundler — siempre se
    // respete, incluida la primera compra tras pegar la llave real.
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.warn(
        'useConfigurePurchases: EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID no está configurada en .env — RevenueCat no se inicializó.',
      );
      return;
    }

    try {
      const alreadyConfigured = await Purchases.isConfigured();

      if (alreadyConfigured) {
        const currentAppUserId = await Purchases.getAppUserID();
        if (currentAppUserId === userId) {
          return;
        }
      }

      Purchases.configure({ apiKey, appUserID: userId });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('useConfigurePurchases: no se pudo configurar RevenueCat.', error);
    }
  }

  return { configurePurchases };
}
