import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matchingService } from '../services/matchingService';
import type { ExploreProfile, ExploreQueueItem } from '../types/matching.types';

const BATCH_SIZE = 25;
const PREFETCH_THRESHOLD = 5;

// Intercala `{ kind: 'ad' }` cada `adInterval` perfiles reales — posicional
// dentro del array ya cargado, nunca antes de la primera card real, no
// depende de cuántos swipes reales hizo el usuario (ver
// features/premium/specs/plan.md → "Card de ads en Explorar — mezcla en el
// cliente, no en el backend"). `profiles` es append-only (ver `loadMore`),
// así que recalcular esto en cada cambio es seguro: el prefijo de `items`
// nunca cambia entre llamadas, `currentIndex` sigue apuntando al mismo item
// tras un `loadMore()`.
function buildQueueItems(
  profiles: ExploreProfile[],
  adInterval: number | null,
): ExploreQueueItem[] {
  if (!adInterval || adInterval <= 0) {
    return profiles.map((profile) => ({ kind: 'profile', profile }));
  }

  const items: ExploreQueueItem[] = [];
  profiles.forEach((profile, i) => {
    items.push({ kind: 'profile', profile });
    if ((i + 1) % adInterval === 0) {
      items.push({ kind: 'ad' });
    }
  });
  return items;
}

// Cuántos perfiles reales (no ads) hay en `items[0..endExclusive)` — usado
// para decidir cuándo prefetchear en base a perfiles restantes reales, no
// en base a la cuenta de items mixtos (que sobreestimaría lo que queda por
// la publicidad intercalada).
function countProfileItems(items: ExploreQueueItem[], endExclusive: number): number {
  let count = 0;
  for (let i = 0; i < endExclusive && i < items.length; i++) {
    if (items[i].kind === 'profile') count++;
  }
  return count;
}

interface UseExploreQueueOptions {
  isPremium?: boolean;
  adInterval?: number | null;
}

export function useExploreQueue(options: UseExploreQueueOptions = {}) {
  const { isPremium = false, adInterval = null } = options;
  const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setProfiles([]);
    setCurrentIndex(0);
    setIsEmpty(false);
    isFetchingRef.current = false;

    let cancelled = false;
    isFetchingRef.current = true;

    matchingService
      .getExploreQueue(BATCH_SIZE)
      .then((result) => {
        if (cancelled) return;
        if (result.length === 0) {
          setIsEmpty(true);
        } else {
          setProfiles(result);
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
      const result = await matchingService.getExploreQueue(BATCH_SIZE);
      // El backend excluye perfiles ya swipeados (tabla `swipes`), pero el
      // prefetch dispara con perfiles del batch actual todavía sin swipear
      // (PREFETCH_THRESHOLD) — esos siguen siendo "no swipeados" para el
      // backend, así que reaparecen tal cual en este segundo batch. Sin
      // este filtro, quedaban duplicados en la cola: al llegar el usuario a
      // esa copia duplicada, el swipe repetido chocaba con el UNIQUE
      // (swiper_id, swiped_id) del backend (500), `advance()` nunca se
      // llamaba (ver useSwipe.ts) y la card se quedaba fuera de pantalla
      // sin nada detrás — pantalla en negro reportada por el humano
      // 2026-08-03.
      setProfiles((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProfiles = result.filter((p) => !existingIds.has(p.id));
        return newProfiles.length > 0 ? [...prev, ...newProfiles] : prev;
      });
    } catch {
      // silently fail
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const items = useMemo(
    () => buildQueueItems(profiles, isPremium ? null : adInterval),
    [profiles, isPremium, adInterval],
  );

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      const consumedProfiles = countProfileItems(items, next);
      const remainingProfiles = profiles.length - consumedProfiles;

      if (remainingProfiles <= PREFETCH_THRESHOLD && !isFetchingRef.current) {
        loadMore();
      }

      if (next >= items.length) {
        setIsEmpty(true);
      }

      return next;
    });
  }, [items, profiles.length, loadMore]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setFetchTrigger((t) => t + 1);
  }, []);

  const currentItem = items[currentIndex] ?? null;

  return {
    currentItem,
    currentIndex,
    isEmpty: isEmpty || (!isLoading && currentItem === null),
    isLoading,
    isLoadingMore,
    advance,
    refresh,
  };
}
