import { useCallback, useEffect, useRef, useState } from 'react';
import { matchingService } from '../services/matchingService';
import type { ExploreProfile } from '../types/matching.types';

const BATCH_SIZE = 25;
const PREFETCH_THRESHOLD = 5;

export function useExploreQueue() {
  const [queue, setQueue] = useState<ExploreProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setQueue([]);
    setCurrentIndex(0);
    setIsEmpty(false);
    isFetchingRef.current = false;

    let cancelled = false;
    isFetchingRef.current = true;

    matchingService
      .getExploreQueue(BATCH_SIZE)
      .then((profiles) => {
        if (cancelled) return;
        if (profiles.length === 0) {
          setIsEmpty(true);
        } else {
          setQueue(profiles);
        }
      })
      .catch(() => {})
      .finally(() => {
        isFetchingRef.current = false;
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTrigger]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const profiles = await matchingService.getExploreQueue(BATCH_SIZE);
      if (profiles.length > 0) {
        setQueue((prev) => [...prev, ...profiles]);
      }
    } catch {
      // silently fail
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      const remaining = queue.length - next;

      if (remaining <= PREFETCH_THRESHOLD && !isFetchingRef.current) {
        loadMore();
      }

      if (next >= queue.length) {
        setIsEmpty(true);
      }

      return next;
    });
  }, [queue.length, loadMore]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setFetchTrigger((t) => t + 1);
  }, []);

  const currentProfile = queue[currentIndex] ?? null;

  return {
    currentProfile,
    isEmpty: isEmpty || (!isLoading && currentProfile === null),
    isLoading,
    isLoadingMore,
    advance,
    refresh,
  };
}
