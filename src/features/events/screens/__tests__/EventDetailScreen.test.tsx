import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EventDetailScreen } from '../EventDetailScreen';
import { useEventDetail } from '../../hooks/useEventDetail';
import type { Event } from '../../types/event.types';

jest.mock('../../hooks/useEventDetail');
jest.mock('../../hooks/useEventRsvp', () => ({
  useEventRsvp: jest.fn(() => ({ updateRsvp: jest.fn(), isLoading: false, error: null })),
}));

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    title: 'Marcha del Orgullo',
    description: 'La marcha anual del orgullo LGBTQ+ en el Zócalo.',
    category: 'pride',
    event_date: '2026-08-01T20:00:00Z',
    location_name: 'Zócalo, CDMX',
    latitude: 19.4326,
    longitude: -99.1332,
    external_link: null,
    image_url: null,
    interested_count: 12,
    going_count: 40,
    my_rsvp_status: null,
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('EventDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el detalle del evento', () => {
    (useEventDetail as jest.Mock).mockReturnValue({
      event: buildEvent(),
      isLoading: false,
      error: null,
      reload: jest.fn(),
      updateEvent: jest.fn(),
    });

    render(<EventDetailScreen eventId="event-1" />);

    expect(screen.getByText('Marcha del Orgullo')).toBeTruthy();
    expect(screen.getByText('Zócalo, CDMX')).toBeTruthy();
    expect(screen.getByText('La marcha anual del orgullo LGBTQ+ en el Zócalo.')).toBeTruthy();
  });

  it('no muestra el botón de link externo si el evento no tiene external_link', () => {
    (useEventDetail as jest.Mock).mockReturnValue({
      event: buildEvent({ external_link: null }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
      updateEvent: jest.fn(),
    });

    render(<EventDetailScreen eventId="event-1" />);

    expect(screen.queryByTestId('event-external-link')).toBeNull();
  });

  it('el link externo abre con Linking.openURL, no con un WebView interno', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    (useEventDetail as jest.Mock).mockReturnValue({
      event: buildEvent({ external_link: 'https://boletos.example.com/marcha-orgullo' }),
      isLoading: false,
      error: null,
      reload: jest.fn(),
      updateEvent: jest.fn(),
    });

    render(<EventDetailScreen eventId="event-1" />);

    expect(screen.getByText('🎟 Comprar boletos →')).toBeTruthy();
    fireEvent.press(screen.getByTestId('event-external-link'));

    expect(openURLSpy).toHaveBeenCalledWith('https://boletos.example.com/marcha-orgullo');
    expect(openURLSpy).toHaveBeenCalledTimes(1);
  });

  it('muestra un loader mientras carga', () => {
    (useEventDetail as jest.Mock).mockReturnValue({
      event: null,
      isLoading: true,
      error: null,
      reload: jest.fn(),
      updateEvent: jest.fn(),
    });

    render(<EventDetailScreen eventId="event-1" />);

    expect(screen.queryByText('Marcha del Orgullo')).toBeNull();
  });

  it('muestra el error y permite reintentar', () => {
    const reload = jest.fn();
    (useEventDetail as jest.Mock).mockReturnValue({
      event: null,
      isLoading: false,
      error: 'Algo salió mal. Revisa tu conexión e intenta de nuevo.',
      reload,
      updateEvent: jest.fn(),
    });

    render(<EventDetailScreen eventId="event-1" />);

    expect(screen.getByText('Algo salió mal. Revisa tu conexión e intenta de nuevo.')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
