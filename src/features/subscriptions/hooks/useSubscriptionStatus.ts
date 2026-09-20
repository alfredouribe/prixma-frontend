import { useCallback, useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';
import type { CustomerInfo } from 'react-native-purchases';

// Identificador real de RevenueCat — con el símbolo `+`, literal. Ver
// features/subscriptions/specs/plan.md → "Identificadores reales de
// RevenueCat".
const PRIXMA_PLUS_ENTITLEMENT = 'Prixma+';

// Fallback solo cuando `customerInfo.managementURL` viene `null` pero el
// entitlement sigue activo — según el propio tipo de `CustomerInfo`,
// `managementURL` "will be null" únicamente "if there are no active
// subscriptions", así que este caso no debería darse en la práctica, pero
// se cubre igual (ver features/subscriptions/specs/tasks.md → "Botón que
// abre customerInfo.managementURL").
const FALLBACK_PLAY_STORE_MANAGEMENT_URL = 'https://play.google.com/store/account/subscriptions';

export type SubscriptionStatusKind =
  | 'never_subscribed'
  | 'active_renewing'
  | 'active_cancelled'
  | 'expired';

export interface SubscriptionStatusData {
  status: SubscriptionStatusKind;
  expirationDate: string | null;
  managementUrl: string | null;
}

const NEVER_SUBSCRIBED: SubscriptionStatusData = {
  status: 'never_subscribed',
  expirationDate: null,
  managementUrl: null,
};

function deriveStatus(customerInfo: CustomerInfo): SubscriptionStatusData {
  const entitlement = customerInfo.entitlements.all[PRIXMA_PLUS_ENTITLEMENT];

  if (!entitlement) {
    return NEVER_SUBSCRIBED;
  }

  if (!entitlement.isActive) {
    return {
      status: 'expired',
      expirationDate: entitlement.expirationDate,
      managementUrl: customerInfo.managementURL,
    };
  }

  return {
    status: entitlement.willRenew ? 'active_renewing' : 'active_cancelled',
    expirationDate: entitlement.expirationDate,
    managementUrl: customerInfo.managementURL ?? FALLBACK_PLAY_STORE_MANAGEMENT_URL,
  };
}

/**
 * Estado real de "Mi suscripción" — leído directo de RevenueCat
 * (`Purchases.getCustomerInfo()`), no de `GET /api/premium/settings`: ese
 * endpoint solo expone un booleano `is_premium` ya calculado y no distingue
 * "cancelada pero sigue activa hasta X" (`willRenew: false`) de "activa con
 * auto-renovación" (`willRenew: true`) — la distinción exacta que pide
 * features/subscriptions/specs/spec.md → "Vistas" → "Sección 'Mi
 * suscripción'".
 *
 * Fail-safe: si RevenueCat no responde (SDK sin configurar — iOS pospuesto,
 * o Android sin la llave todavía — o sin conexión) se asume
 * `never_subscribed` en vez de bloquear la pantalla o lanzar.
 */
export function useSubscriptionStatus() {
  const [data, setData] = useState<SubscriptionStatusData>(NEVER_SUBSCRIBED);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);

    return Purchases.getCustomerInfo()
      .then((customerInfo) => {
        setData(deriveStatus(customerInfo));
      })
      .catch((error) => {
        setData(NEVER_SUBSCRIBED);
        // eslint-disable-next-line no-console
        console.warn('useSubscriptionStatus: no se pudo leer el estado de RevenueCat.', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, isLoading, refresh };
}
