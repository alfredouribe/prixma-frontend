import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useEventDetail } from '../useEventDetail';
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
    my_rsvp_status: null,
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('useEventDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga el detalle del evento', async () => {
    (eventService.getEvent as jest.Mock).mockResolvedValue(buildEvent());
    const { result } = renderHook(() => useEventDetail('event-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(eventService.getEvent).toHaveBeenCalledWith('event-1');
    expect(result.current.event?.id).toBe('event-1');
    expect(result.current.error).toBeNull();
  });

  it('setea un mensaje de error si falla la carga', async () => {
    (eventService.getEvent as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useEventDetail('event-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(result.current.event).toBeNull();
  });

  it('updateEvent reemplaza el evento en memoria sin volver a pedir el detalle', async () => {
    (eventService.getEvent as jest.Mock).mockResolvedValue(buildEvent({ my_rsvp_status: null }));
    const { result } = renderHook(() => useEventDetail('event-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(eventService.getEvent).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.updateEvent(buildEvent({ my_rsvp_status: 'going', going_count: 6 }));
    });

    expect(result.current.event?.my_rsvp_status).toBe('going');
    expect(result.current.event?.going_count).toBe(6);
    expect(eventService.getEvent).toHaveBeenCalledTimes(1);
  });
});
