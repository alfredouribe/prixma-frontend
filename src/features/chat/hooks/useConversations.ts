import { useCallback, useState } from 'react';
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

  const refresh = useCallback(() => load(true), [load]);

  return { matches, requests, isLoading, isRefreshing, error, refresh };
}
