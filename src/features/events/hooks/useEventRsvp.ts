import { useState } from 'react';
import { eventService } from '../services/eventService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Event, RsvpStatus } from '../types/event.types';

/**
 * Llama al único endpoint de RSVP (`POST /events/{id}/rsvp`, upsert — ver
 * plan.md). No mantiene la lista/el evento en su propio estado: quien lo usa
 * (`EventRsvpControl`) decide cómo reflejar el `Event` actualizado que
 * devuelve el backend.
 */
export function useEventRsvp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateRsvp(eventId: string, status: RsvpStatus): Promise<Event | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await eventService.rsvp(eventId, status);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { updateRsvp, isLoading, error };
}
