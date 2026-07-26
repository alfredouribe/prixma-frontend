import { renderHook, act } from '@testing-library/react-native';
import { useEventRsvp } from '../useEventRsvp';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types/event.types';

jest.mock('../../services/eventService');

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    title: 'Marcha del Orgullo',
    description: '...',
    category: 'pride',
    event_date: '2026-08-01T20:00:00Z',
    location_name: 'Zócalo, CDMX',
    latitude: null,
    longitude: null,
    external_link: null,
    image_url: null,
    interested_count: 3,
    going_count: 5,
    my_rsvp_status: 'going',
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('useEventRsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('llama a eventService.rsvp y retorna el evento actualizado', async () => {
    const updated = buildEvent();
    (eventService.rsvp as jest.Mock).mockResolvedValue(updated);
    const { result } = renderHook(() => useEventRsvp());

    let response: Event | null = null;
    await act(async () => {
      response = await result.current.updateRsvp('event-1', 'going');
    });

    expect(eventService.rsvp).toHaveBeenCalledWith('event-1', 'going');
    expect(response).toEqual(updated);
    expect(result.current.error).toBeNull();
  });

  it('setea un mensaje de error y retorna null si falla', async () => {
    (eventService.rsvp as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useEventRsvp());

    let response: Event | null = buildEvent();
    await act(async () => {
      response = await result.current.updateRsvp('event-1', 'not_going');
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });
});
