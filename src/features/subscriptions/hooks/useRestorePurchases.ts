import { useCallback, useState } from 'react';
import Purchases from 'react-native-purchases';
import { premiumService } from '../../premium/services/premiumService';

// Identificador real de RevenueCat — con el símbolo `+`, literal. Ver
// features/subscriptions/specs/plan.md → "Identificadores reales de
// RevenueCat".
const PRIXMA_PLUS_ENTITLEMENT = 'Prixma+';

// Copy borrador, ver brand/copies.md → "⚠️ Borradores pendientes de
// revisión (Mafer)" → "Restaurar compras" (autorizado por el humano
// 2026-09-27).
const RESTORE_ERROR = 'No se pudieron restaurar tus compras. Intenta de nuevo.';
const RESTORE_SUCCESS_ACTIVE = 'Listo, encontramos tu compra — Prixma+ ya está activo.';
const RESTORE_SUCCESS_NONE = 'No encontramos ninguna compra de Prixma+ asociada a esta cuenta.';

/**
 * Botón "Restaurar compras" (`SubscriptionScreen.tsx`) — buena práctica ya
 * en Android, obligatorio más adelante en iOS (ver
 * features/subscriptions/specs/spec.md → Goals).
 *
 * `message` (agregado 2026-09-27, bug real reportado por el humano: el
 * botón llamaba a `Purchases.restorePurchases()` de verdad, pero nunca
 * mostraba ningún resultado — ni éxito ni "no había nada que restaurar" —
 * así que parecía no tener funcionalidad) distingue ambos casos leyendo el
 * `CustomerInfo` que la propia llamada devuelve. Mismo criterio de refresco
 * que `usePurchasePrixmaPlus`: ese `CustomerInfo` es la verdad inmediata del
 * lado cliente, el refetch de `/premium/settings` es solo best-effort para
 * el resto de los gates de la app que sí dependen de ese endpoint.
 */
export function useRestorePurchases() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const restore = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    setError(null);
    setMessage(null);

    try {
      const customerInfo = await Purchases.restorePurchases();
      const restored = Boolean(customerInfo.entitlements.active[PRIXMA_PLUS_ENTITLEMENT]);
      setMessage(restored ? RESTORE_SUCCESS_ACTIVE : RESTORE_SUCCESS_NONE);

      // Best-effort — mismo criterio que usePurchasePrixmaPlus, nunca
      // bloquea ni reintenta.
      premiumService.getSettings().catch(() => {});

      return restored;
    } catch {
      setError(RESTORE_ERROR);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { restore, isRestoring, error, message };
}
