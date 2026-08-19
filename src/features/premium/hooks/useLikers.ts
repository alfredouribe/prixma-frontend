import { useCallback, useEffect, useState } from 'react';
import { matchingService } from '../../matching/services/matchingService';
import { extractApiError } from '../../../lib/extractApiError';
import type { ExploreProfile, SwipeResult } from '../../matching/types/matching.types';

// El backend rechaza GET /matching/likers con 403 cuando el usuario no
// tiene acceso (sin Prixma+ ni `see_likers_until` vigente) — sin
// `error_code` en el body, el formato de error del proyecto es siempre
// `{ message }`, así que el status code es la única forma confiable de
// distinguir este caso de cualquier otro error. Mismo patrón exacto que
// `isLikeLimitError()` en useSwipe.ts. Ver
// features/premium/specs/spec.md → "Ver quién te dio like".
function isForbiddenError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 403;
}

interface LikerMatchResult {
  matchId: string;
  otherProfile: ExploreProfile;
}

/**
 * Trae la lista de personas que le dieron like/super_like al usuario
 * (GET /matching/likers) y permite darles like de vuelta con el mismo
 * endpoint de swipe de siempre — como el like inverso ya existe, esto
 * genera match instantáneo, sin mecanismo nuevo (ver
 * features/premium/specs/plan.md → "Frontend").
 */
export function useLikers() {
  const [likers, setLikers] = useState<ExploreProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likingProfileId, setLikingProfileId] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<LikerMatchResult | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNeedsUpgrade(false);
    setError(null);

    matchingService
      .getLikers()
      .then((result) => {
        if (!cancelled) setLikers(result);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isForbiddenError(err)) {
          setNeedsUpgrade(true);
        } else {
          setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  // Dar like de vuelta a alguien de la lista — reusa matchingService.swipe()
  // tal cual (sin mecanismo nuevo). Éxito: se quita de la lista local (ya
  // se tomó una decisión sobre esa persona) y, si generó match (el caso
  // esperado, ya que el like inverso ya existía), se expone matchResult
  // para que la screen muestre MatchOverlay — mismo patrón que useSwipe.ts.
  const likeBack = useCallback(async (profile: ExploreProfile) => {
    setLikingProfileId(profile.id);
    setLikeError(null);

    try {
      const result: SwipeResult = await matchingService.swipe(profile.id, 'like');
      setLikers((prev) => prev.filter((p) => p.id !== profile.id));

      if (result.matched && result.match_id) {
        setMatchResult({ matchId: result.match_id, otherProfile: profile });
      }
    } catch (err) {
      setLikeError(extractApiError(err, 'No se pudo dar like. Intenta de nuevo.'));
    } finally {
      setLikingProfileId(null);
    }
  }, []);

  const dismissMatch = useCallback(() => {
    setMatchResult(null);
  }, []);

  return {
    likers,
    isLoading,
    needsUpgrade,
    error,
    refresh,
    likeBack,
    likingProfileId,
    likeError,
    matchResult,
    dismissMatch,
  };
}
