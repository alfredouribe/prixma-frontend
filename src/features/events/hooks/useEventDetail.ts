import { useCallback, useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Event } from '../types/event.types';

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  // Actualiza el evento en memoria con la respuesta de `POST .../rsvp` — sin
  // volver a pedir el detalle completo (ver requisito de tasks.md: "refleja
  // el nuevo estado sin recargar la pantalla").
  const updateEvent = useCallback((updated: Event) => {
    setEvent(updated);
  }, []);

  return { event, isLoading, error, reload: load, updateEvent };
}
