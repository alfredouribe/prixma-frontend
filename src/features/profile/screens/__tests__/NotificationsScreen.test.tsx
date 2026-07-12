import { render, screen, fireEvent } from '@testing-library/react-native';
import { Switch } from 'react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import type { ProfileSettings } from '../../types/profile.types';

jest.mock('../../hooks/useProfileSettings');

function buildSettings(overrides: Partial<ProfileSettings> = {}): ProfileSettings {
  return {
    id: 'settings-1',
    selfie_verification_enabled: true,
    incognito_mode_enabled: false,
    geo_block_enabled: false,
    reports_enabled: true,
    notify_matches_enabled: true,
    notify_messages_enabled: true,
    notify_events_enabled: true,
    ...overrides,
  };
}

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título y los 3 toggles con sus labels', () => {
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: buildSettings(),
      isLoading: false,
      error: null,
      toggle: jest.fn(),
      reload: jest.fn(),
    });

    render(<NotificationsScreen />);

    expect(screen.getByText('Notificaciones')).toBeTruthy();
    expect(screen.getByText('Matches')).toBeTruthy();
    expect(screen.getByText('Mensajes')).toBeTruthy();
    expect(screen.getByText('Eventos')).toBeTruthy();
  });

  it('muestra el indicador de carga mientras isLoading es true', () => {
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: null,
      isLoading: true,
      error: null,
      toggle: jest.fn(),
      reload: jest.fn(),
    });

    render(<NotificationsScreen />);

    expect(screen.queryByText('Mensajes')).toBeNull();
  });

  it('muestra el error y permite reintentar si la carga falla', () => {
    const reload = jest.fn();
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: null,
      isLoading: false,
      error: 'Algo salió mal. Revisa tu conexión e intenta de nuevo.',
      toggle: jest.fn(),
      reload,
    });

    render(<NotificationsScreen />);

    expect(screen.getByText('Algo salió mal. Revisa tu conexión e intenta de nuevo.')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('llama a toggle con la key correcta al accionar el switch de mensajes', () => {
    const toggle = jest.fn();
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: buildSettings(),
      isLoading: false,
      error: null,
      toggle,
      reload: jest.fn(),
    });

    render(<NotificationsScreen />);

    // Orden de TOGGLES: matches(0), mensajes(1), eventos(2)
    const switches = screen.UNSAFE_getAllByType(Switch);
    fireEvent(switches[1], 'valueChange', false);

    expect(toggle).toHaveBeenCalledWith('notify_messages_enabled');
  });
});
