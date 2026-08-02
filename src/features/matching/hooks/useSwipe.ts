import { useCallback, useState } from 'react';
import { matchingService } from '../services/matchingService';
import type { ExploreProfile, Match, SwipeDirection, SwipeResult } from '../types/matching.types';

interface UseSwipeProps {
  onSwipeComplete: () => void;
}

// El backend rechaza el like/super_like número `free_likes_per_day + 1` del
// día con 429 (sin `error_code` en el body — el formato de error del
// proyecto es siempre `{ message }`, así que el status code es la única
// forma confiable de distinguir este caso de cualquier otro error, mismo
// patrón que `useSendMessage.ts` distingue 404). Ver
// features/premium/specs/spec.md → "Paywall al agotar likes del día".
function isLikeLimitError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 429;
}

export function useSwipe({ onSwipeComplete }: UseSwipeProps) {
  const [matchResult, setMatchResult] = useState<{
    matchId: string;
    otherProfile: ExploreProfile;
  } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  // Se incrementa en cada swipe fallido — combinado en el `key` de
  // ProfileCard (ExploreScreen.tsx) para forzar un remount. La animación
  // de salida (Reanimated) ya movió la card fuera de pantalla antes de que
  // el request confirmara el swipe; si el request falla, `advance()` nunca
  // se llama (a propósito, un swipe fallido no debe contar como visto), así
  // que sin remount la misma card se queda con las mismas shared values
  // "voladas" — invisible para siempre, sin nada detrás. Ver comentario en
  // useExploreQueue.ts sobre el bug real que dejaba esto en negro.
  const [failedSwipeToken, setFailedSwipeToken] = useState(0);
  // Distinto de un swipe fallido genérico: el límite diario de likes es un
  // caso esperado de negocio, no un error de red/servidor — dispara el
  // paywall de Premium en vez de simplemente permitir reintentar.
  const [showLikeLimitPaywall, setShowLikeLimitPaywall] = useState(false);

  const swipe = useCallback(
    async (profile: ExploreProfile, direction: SwipeDirection) => {
      if (isSwiping) return;
      setIsSwiping(true);

      try {
        const result: SwipeResult = await matchingService.swipe(profile.id, direction);
        onSwipeComplete();

        if (result.matched && result.match_id) {
          setMatchResult({ matchId: result.match_id, otherProfile: profile });
        }
      } catch (err) {
        // No avanza (un swipe fallido no cuenta como visto) — solo fuerza
        // el remount de la card para que vuelva a verse en su posición
        // original y el usuario pueda reintentar.
        setFailedSwipeToken((t) => t + 1);
        if (isLikeLimitError(err)) {
          setShowLikeLimitPaywall(true);
        }
      } finally {
        setIsSwiping(false);
      }
    },
    [isSwiping, onSwipeComplete],
  );

  const dismissMatch = useCallback(() => {
    setMatchResult(null);
  }, []);

  const dismissLikeLimitPaywall = useCallback(() => {
    setShowLikeLimitPaywall(false);
  }, []);

  return {
    swipe,
    matchResult,
    isSwiping,
    dismissMatch,
    failedSwipeToken,
    showLikeLimitPaywall,
    dismissLikeLimitPaywall,
  };
}
