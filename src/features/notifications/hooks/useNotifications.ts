import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { notificationService } from '../services/notificationService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Notification } from '../types/notification.types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await notificationService.getNotifications(1);
      setNotifications(result.notifications);
      setPage(1);
      setHasMore(result.meta.currentPage < result.meta.lastPage);

      // spec.md → Acceptance Criteria: "WHEN usuario abre la pantalla de
      // notificaciones → el badge desaparece". Se marcan todas como
      // leídas en cada carga (mount, foco de vuelta, pull-to-refresh) sin
      // esperar a que el usuario toque cada una — best-effort: si falla,
      // la lista ya cargó bien, solo el `read_at` local no se actualiza
      // hasta el siguiente intento.
      if (result.notifications.some((n) => n.read_at === null)) {
        await notificationService.markAllRead();
        setNotifications((prev) =>
          prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
        );
      }
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(() => load(true), [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await notificationService.getNotifications(nextPage);
      setNotifications((prev) => [...prev, ...result.notifications]);
      setPage(nextPage);
      setHasMore(result.meta.currentPage < result.meta.lastPage);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isLoading, page]);

  // Marca una notificación puntual como leída — llamado desde
  // `NotificationItem` al tocarla (además del marcado masivo de `load`,
  // por si el usuario toca una notificación que llegó después de abrir la
  // pantalla, p. ej. vía pull-to-refresh).
  const markRead = useCallback(async (id: string) => {
    try {
      const updated = await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {
      // Silencioso — la navegación al deep link ya ocurrió en
      // `NotificationItem` antes de invocar este callback, no la bloquea.
    }
  }, []);

  return {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    markRead,
  };
}
