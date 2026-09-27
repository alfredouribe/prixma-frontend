import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { premiumService } from '../services/premiumService';
import { extractApiError } from '../../../lib/extractApiError';
import type { PremiumSettings } from '../types/premium.types';

/**
 * Trae `GET /api/premium/settings` en cada foco de pantalla, no solo al
 * montar — antes era un `useEffect([])` de una sola vez, y como las
 * screens que lo usan (`MyProfileScreen`, `SubscriptionScreen`,
 * `ExploreScreen`) viven dentro de tabs que Expo Router nunca desmonta,
 * "Prixma+ activo" se quedaba con el valor de la primera carga de la
 * sesión para siempre — un usuario que compraba, salía a otra pantalla y
 * volvía nunca veía el cambio reflejado sin cerrar y reabrir la app
 * (bug real reportado 2026-09-27). El estado de `isLoading`/`error` solo
 * se actualiza en la primera carga (`hasLoadedOnceRef`) para no meter un
 * parpadeo de carga cada vez que se re-enfoca la pantalla — los refetches
 * posteriores son silenciosos, `settings` se actualiza si resuelven.
 *
 * `settings` queda en `null` si la carga falla — el llamador debe tratar
 * eso como "sin ads, sin límites de cliente" (fail-open: nunca bloquear la
 * app si este endpoint no responde), nunca como "usuario premium".
 */
export function usePremiumSettings() {
  const [settings, setSettings] = useState<PremiumSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const isFirstLoad = !hasLoadedOnceRef.current;
      if (isFirstLoad) setIsLoading(true);

      premiumService
        .getSettings()
        .then((data) => {
          if (!cancelled) {
            setSettings(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled && isFirstLoad) {
            setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
          }
        })
        .finally(() => {
          if (!cancelled) {
            hasLoadedOnceRef.current = true;
            if (isFirstLoad) setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return { settings, isLoading, error };
}
