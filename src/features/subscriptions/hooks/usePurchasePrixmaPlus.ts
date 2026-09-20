import { useCallback, useState } from 'react';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import type { PurchasesError } from 'react-native-purchases';
import { premiumService } from '../../premium/services/premiumService';

// Identificador real de RevenueCat — con el símbolo `+`, literal (NO
// "premium"). Ver features/subscriptions/specs/plan.md → "Identificadores
// reales de RevenueCat".
const PRIXMA_PLUS_ENTITLEMENT = 'Prixma+';

// [COPY PENDIENTE] — sin texto aprobado en brand/copies.md para mensajes de
// error de compra real (ver features/subscriptions/specs/tasks.md → "Copy —
// regla dura del proyecto"). No se muestra ningún mensaje cuando el usuario
// simplemente cancela el diálogo de compra — eso no es un error.
const OFFER_NOT_AVAILABLE_ERROR =
  '[COPY PENDIENTE] La oferta de Prixma+ no está disponible en este momento. Intenta de nuevo más tarde.';
const GENERIC_PURCHASE_ERROR = '[COPY PENDIENTE] No se pudo completar la compra. Intenta de nuevo.';

function isUserCancelledError(err: unknown): boolean {
  const code = (err as Partial<PurchasesError>)?.code;
  return code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

/**
 * Compra real de Prixma+ (RevenueCat → Google Play Billing, producto
 * `prixma_plus_monthly:monthly`, offering `default` → package
 * `$rc_monthly`) — conecta los paywalls existentes (`LikeLimitPaywall`,
 * paywall inline de `WhoLikedMeScreen`, y la propia `SubscriptionScreen`
 * cuando el usuario nunca se ha suscrito) a la compra real. Ver
 * features/subscriptions/specs/plan.md → "Compra real desde los paywalls
 * existentes" para el detalle completo, incluida la nota de lag del
 * webhook que se resume aquí:
 *
 * `purchasePackage()` resuelve con el `CustomerInfo` del lado del cliente
 * inmediatamente tras la compra, pero el backend (`subscriptions` en BD)
 * solo se entera cuando llega el webhook de RevenueCat — puede tardar unos
 * segundos. `customerInfo.entitlements.active['Prixma+']` es la
 * confirmación real e inmediata de que la compra se completó (lo que este
 * hook usa para decidir el `true`/`false` que devuelve); el refetch de
 * `/premium/settings` de abajo es solo best-effort para adelantar la UI si
 * el webhook ya alcanzó a llegar — nunca se reintenta ni bloquea nada.
 */
export function usePurchasePrixmaPlus() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(async (): Promise<boolean> => {
    setIsPurchasing(true);
    setError(null);

    try {
      const offerings = await Purchases.getOfferings();
      const monthlyPackage = offerings.current?.monthly;

      if (!monthlyPackage) {
        setError(OFFER_NOT_AVAILABLE_ERROR);
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(monthlyPackage);
      const purchased = Boolean(customerInfo.entitlements.active[PRIXMA_PLUS_ENTITLEMENT]);

      // Best-effort — ver nota de lag del webhook en el docblock de arriba.
      premiumService.getSettings().catch(() => {});

      return purchased;
    } catch (err) {
      if (!isUserCancelledError(err)) {
        setError(GENERIC_PURCHASE_ERROR);
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return { purchase, isPurchasing, error };
}
