import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { chatService } from '../services/chatService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Conversation } from '../types/chat.types';

export function useConversations() {
  const [matches, setMatches] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const inbox = await chatService.getConversations();
      setMatches(inbox.matches);
      setRequests(inbox.requests);
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

  // Bug real reportado 2026-10-02: con la pantalla de Chats ya en foco
  // (abierta antes de minimizar la app), `useFocusEffect` no vuelve a
  // dispararse al reabrirla — solo rastrea foco de navegación entre
  // pantallas, no el ciclo de vida de la app a nivel SO. Sin esto, un
  // mensaje nuevo llegado mientras la app estaba en segundo plano no
  // aparecía hasta cambiar de pestaña y volver (eso sí dispara un foco de
  // navegación real). `useConversations` nunca tuvo tampoco una suscripción
  // en vivo (a diferencia de `useConversation`, dentro de un chat
  // individual) — la bandeja siempre dependió 100% de este refetch.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        load();
      }
    });

    return () => subscription.remove();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { matches, requests, isLoading, isRefreshing, error, refresh };
}
