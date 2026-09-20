import { useCallback, useState } from 'react';
import Purchases from 'react-native-purchases';
import { premiumService } from '../../premium/services/premiumService';

// [COPY PENDIENTE] — sin texto aprobado en brand/copies.md para el mensaje
// de error de "Restaurar compras" (ver features/subscriptions/specs/tasks.md
// → "Copy — regla dura del proyecto").
const RESTORE_ERROR = '[COPY PENDIENTE] No se pudieron restaurar tus compras. Intenta de nuevo.';

/**
 * Botón "Restaurar compras" (`SubscriptionScreen.tsx`) — buena práctica ya
 * en Android, obligatorio más adelante en iOS (ver
 * features/subscriptions/specs/spec.md → Goals). Mismo criterio de refresco
 * que `usePurchasePrixmaPlus`: el `CustomerInfo` que devuelve la propia
 * llamada es la verdad inmediata (no se inspecciona aquí — el llamador
 * vuelve a leer el estado real vía `useSubscriptionStatus.refresh()`), el
 * refetch de `/premium/settings` es solo best-effort para el resto de los
 * gates de la app que sí dependen de ese endpoint.
 */
export function useRestorePurchases() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    setError(null);

    try {
      await Purchases.restorePurchases();

      // Best-effort — mismo criterio que usePurchasePrixmaPlus, nunca
      // bloquea ni reintenta.
      premiumService.getSettings().catch(() => {});

      return true;
    } catch {
      setError(RESTORE_ERROR);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { restore, isRestoring, error };
}
