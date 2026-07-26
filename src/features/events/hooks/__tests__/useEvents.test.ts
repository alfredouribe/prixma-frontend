import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useEvents } from '../useEvents';
import { eventService } from '../../services/eventService';
import type { Event, EventsPage } from '../../types/event.types';

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

function buildPage(events: Event[], overrides: Partial<EventsPage['meta']> = {}): EventsPage {
  return {
    events,
    meta: { currentPage: 1, lastPage: 1, perPage: 15, total: events.length, ...overrides },
  };
}

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga eventos al montar con el filtro "all" (sin category/date)', async () => {
    (eventService.getEvents as jest.Mock).mockResolvedValue(buildPage([buildEvent()]));
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(eventService.getEvents).toHaveBeenCalledWith({ page: 1 });
    expect(result.current.events).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('setea un mensaje de error si falla la carga', async () => {
    (eventService.getEvents as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(result.current.events).toEqual([]);
  });

  it('cambiar a una categoría manda el filtro correcto al backend', async () => {
    (eventService.getEvents as jest.Mock).mockResolvedValue(buildPage([]));
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.changeFilter('pride');
    });

    await waitFor(() =>
      expect(eventService.getEvents).toHaveBeenLastCalledWith({ category: 'pride', page: 1 }),
    );
  });

  it('cambiar a "Esta semana" manda date_from/date_to en vez de category', async () => {
    (eventService.getEvents as jest.Mock).mockResolvedValue(buildPage([]));
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.changeFilter('this_week');
    });

    await waitFor(() => expect(eventService.getEvents).toHaveBeenCalledTimes(2));
    const lastCallArgs = (eventService.getEvents as jest.Mock).mock.calls[1][0];
    expect(lastCallArgs.category).toBeUndefined();
    expect(typeof lastCallArgs.date_from).toBe('string');
    expect(typeof lastCallArgs.date_to).toBe('string');
    expect(lastCallArgs.page).toBe(1);
  });

  it('updateEvent reemplaza un evento puntual sin recargar toda la lista', async () => {
    (eventService.getEvents as jest.Mock).mockResolvedValue(
      buildPage([buildEvent({ id: 'event-1', my_rsvp_status: null })]),
    );
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(eventService.getEvents).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.updateEvent(buildEvent({ id: 'event-1', my_rsvp_status: 'going', going_count: 6 }));
    });

    expect(result.current.events[0].my_rsvp_status).toBe('going');
    expect(result.current.events[0].going_count).toBe(6);
    expect(eventService.getEvents).toHaveBeenCalledTimes(1);
  });
});
