import { render, screen, fireEvent } from '@testing-library/react-native';
import { Switch } from 'react-native';
import { PrivacyScreen } from '../PrivacyScreen';
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

describe('PrivacyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título y los 4 toggles con sus labels', () => {
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: buildSettings(),
      isLoading: false,
      error: null,
      toggle: jest.fn(),
      reload: jest.fn(),
    });

    render(<PrivacyScreen />);

    expect(screen.getByText('Privacidad y visibilidad')).toBeTruthy();
    expect(screen.getByText('Verificación con selfie')).toBeTruthy();
    expect(screen.getByText('Modo incógnito')).toBeTruthy();
    expect(screen.getByText('Bloqueo geográfico')).toBeTruthy();
    expect(screen.getByText('Reportes con consecuencias')).toBeTruthy();
  });

  it('muestra el indicador de carga mientras isLoading es true', () => {
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: null,
      isLoading: true,
      error: null,
      toggle: jest.fn(),
      reload: jest.fn(),
    });

    render(<PrivacyScreen />);

    expect(screen.queryByText('Modo incógnito')).toBeNull();
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

    render(<PrivacyScreen />);

    expect(screen.getByText('Algo salió mal. Revisa tu conexión e intenta de nuevo.')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('llama a toggle con la key correcta al accionar el switch de modo incógnito', () => {
    const toggle = jest.fn();
    (useProfileSettings as jest.Mock).mockReturnValue({
      settings: buildSettings(),
      isLoading: false,
      error: null,
      toggle,
      reload: jest.fn(),
    });

    render(<PrivacyScreen />);

    // Orden de TOGGLES: selfie(0), incognito(1), geo(2), reportes(3)
    const switches = screen.UNSAFE_getAllByType(Switch);
    fireEvent(switches[1], 'valueChange', true);

    expect(toggle).toHaveBeenCalledWith('incognito_mode_enabled');
  });
});
