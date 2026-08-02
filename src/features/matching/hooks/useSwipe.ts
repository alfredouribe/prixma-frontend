import { useCallback, useState } from 'react';
import { matchingService } from '../services/matchingService';
import type { ExploreProfile, Match, SwipeDirection, SwipeResult } from '../types/matching.types';

interface UseSwipeProps {
  onSwipeComplete: () => void;
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
      } catch {
        // No avanza (un swipe fallido no cuenta como visto) — solo fuerza
        // el remount de la card para que vuelva a verse en su posición
        // original y el usuario pueda reintentar.
        setFailedSwipeToken((t) => t + 1);
      } finally {
        setIsSwiping(false);
      }
    },
    [isSwiping, onSwipeComplete],
  );

  const dismissMatch = useCallback(() => {
    setMatchResult(null);
  }, []);

  return { swipe, matchResult, isSwiping, dismissMatch, failedSwipeToken };
}
