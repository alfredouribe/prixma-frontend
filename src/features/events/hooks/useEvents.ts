import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { eventService } from '../services/eventService';
import { extractApiError } from '../../../lib/extractApiError';
import { thisWeekRange } from '../utils/formatEventDate';
import type { Event, EventCategory, EventsFilters } from '../types/event.types';

// `'all'`/`'this_week'` son atajos de UI, no categorías reales del backend
// (ver brand/copies.md → "Eventos" → Categorías: `Todos`, `Esta semana`,
// `Pride`, `Social`, `Arte`, `Activismo`).
export type EventFilterKey = 'all' | 'this_week' | EventCategory;

function buildFilters(filter: EventFilterKey): EventsFilters {
  if (filter === 'all') return {};
  if (filter === 'this_week') return thisWeekRange();
  return { category: filter };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<EventFilterKey>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (activeFilter: EventFilterKey, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await eventService.getEvents({ ...buildFilters(activeFilter), page: 1 });
      setEvents(result.events);
      setPage(1);
      setHasMore(result.meta.currentPage < result.meta.lastPage);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [load, filter]),
  );

  const changeFilter = useCallback((next: EventFilterKey) => {
    setFilter(next);
  }, []);

  const refresh = useCallback(() => load(filter, true), [load, filter]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await eventService.getEvents({ ...buildFilters(filter), page: nextPage });
      setEvents((prev) => [...prev, ...result.events]);
      setPage(nextPage);
      setHasMore(result.meta.currentPage < result.meta.lastPage);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, hasMore, isLoadingMore, isLoading, page]);

  // Actualiza un evento puntual con la respuesta de `POST .../rsvp` — sin
  // recargar toda la lista (ver requisito de tasks.md).
  const updateEvent = useCallback((updated: Event) => {
    setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  return {
    events,
    filter,
    changeFilter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    updateEvent,
  };
}
