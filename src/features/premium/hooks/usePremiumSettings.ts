import { useEffect, useState } from 'react';
import { premiumService } from '../services/premiumService';
import { extractApiError } from '../../../lib/extractApiError';
import type { PremiumSettings } from '../types/premium.types';

/**
 * Trae `GET /api/premium/settings` una sola vez por sesión — no usa Zustand
 * porque `is_premium`/los 3 números no cambian durante la sesión salvo que
 * se edite desde Filament (ver features/premium/specs/plan.md → "Frontend").
 *
 * `settings` queda en `null` si la carga falla — el llamador debe tratar
 * eso como "sin ads, sin límites de cliente" (fail-open: nunca bloquear la
 * app si este endpoint no responde), nunca como "usuario premium".
 */
export function usePremiumSettings() {
  const [settings, setSettings] = useState<PremiumSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    premiumService
      .getSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, isLoading, error };
}
