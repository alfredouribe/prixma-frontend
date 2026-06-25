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
        // Swipe failed silently — card goes back via animation
      } finally {
        setIsSwiping(false);
      }
    },
    [isSwiping, onSwipeComplete],
  );

  const dismissMatch = useCallback(() => {
    setMatchResult(null);
  }, []);

  return { swipe, matchResult, isSwiping, dismissMatch };
}
