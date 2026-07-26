import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { EventRsvpControl } from '../EventRsvpControl';
import { useEventRsvp } from '../../hooks/useEventRsvp';
import type { Event } from '../../types/event.types';

jest.mock('../../hooks/useEventRsvp');

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    title: 'Marcha del Orgullo',
    description: 'Descripción del evento',
    category: 'pride',
    event_date: '2026-08-01T20:00:00Z',
    location_name: 'Zócalo, CDMX',
    latitude: null,
    longitude: null,
    external_link: null,
    image_url: null,
    interested_count: 3,
    going_count: 5,
    my_rsvp_status: 'interested',
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('EventRsvpControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra las 3 opciones de RSVP con el copy exacto', () => {
    (useEventRsvp as jest.Mock).mockReturnValue({ updateRsvp: jest.fn(), isLoading: false, error: null });

    render(<EventRsvpControl eventId="event-1" status={null} />);

    expect(screen.getByText('Me interesa')).toBeTruthy();
    expect(screen.getByText('Iré')).toBeTruthy();
    expect(screen.getByText('No iré')).toBeTruthy();
  });

  it('refleja el estado inicial como seleccionado', () => {
    (useEventRsvp as jest.Mock).mockReturnValue({ updateRsvp: jest.fn(), isLoading: false, error: null });

    render(<EventRsvpControl eventId="event-1" status="interested" />);

    expect(
      screen.getByTestId('event-rsvp-event-1-interested').props.accessibilityState.checked,
    ).toBe(true);
    expect(screen.getByTestId('event-rsvp-event-1-going').props.accessibilityState.checked).toBe(false);
  });

  it('al tocar una opción distinta, llama a updateRsvp con el eventId y el estado correctos', async () => {
    const updated = buildEvent({ my_rsvp_status: 'going', going_count: 6 });
    const updateRsvp = jest.fn().mockResolvedValue(updated);
    (useEventRsvp as jest.Mock).mockReturnValue({ updateRsvp, isLoading: false, error: null });
    const onChanged = jest.fn();

    render(<EventRsvpControl eventId="event-1" status="interested" onChanged={onChanged} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('event-rsvp-event-1-going'));
    });

    expect(updateRsvp).toHaveBeenCalledWith('event-1', 'going');
    expect(onChanged).toHaveBeenCalledWith(updated);
  });

  it('refleja el nuevo estado seleccionado sin recargar la pantalla', async () => {
    const updateRsvp = jest.fn().mockResolvedValue(buildEvent({ my_rsvp_status: 'going' }));
    (useEventRsvp as jest.Mock).mockReturnValue({ updateRsvp, isLoading: false, error: null });

    render(<EventRsvpControl eventId="event-1" status="interested" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('event-rsvp-event-1-going'));
    });

    expect(screen.getByTestId('event-rsvp-event-1-going').props.accessibilityState.checked).toBe(true);
    expect(
      screen.getByTestId('event-rsvp-event-1-interested').props.accessibilityState.checked,
    ).toBe(false);
  });

  it('no hace nada si se toca la opción ya seleccionada', async () => {
    const updateRsvp = jest.fn();
    (useEventRsvp as jest.Mock).mockReturnValue({ updateRsvp, isLoading: false, error: null });

    render(<EventRsvpControl eventId="event-1" status="interested" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('event-rsvp-event-1-interested'));
    });

    expect(updateRsvp).not.toHaveBeenCalled();
  });

  it('si la llamada falla (updateRsvp resuelve null), revierte al estado anterior', async () => {
    const updateRsvp = jest.fn().mockResolvedValue(null);
    (useEventRsvp as jest.Mock).mockReturnValue({
      updateRsvp,
      isLoading: false,
      error: 'Algo salió mal. Revisa tu conexión e intenta de nuevo.',
    });

    render(<EventRsvpControl eventId="event-1" status="interested" />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('event-rsvp-event-1-going'));
    });

    expect(
      screen.getByTestId('event-rsvp-event-1-interested').props.accessibilityState.checked,
    ).toBe(true);
    expect(
      screen.getByText('Algo salió mal. Revisa tu conexión e intenta de nuevo.'),
    ).toBeTruthy();
  });
});
