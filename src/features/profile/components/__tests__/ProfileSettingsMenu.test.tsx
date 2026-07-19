import { render, screen, fireEvent } from '@testing-library/react-native';
import { ProfileSettingsMenu } from '../ProfileSettingsMenu';
import { useLogout } from '../../../auth/hooks/useLogout';
import { router } from 'expo-router';

jest.mock('../../../auth/hooks/useLogout');

describe('ProfileSettingsMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLogout as jest.Mock).mockReturnValue({ handleLogout: jest.fn(), isLoading: false });
  });

  it('muestra las entradas de Bloqueades y Bloqueo geográfico con su descripción', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    expect(screen.getByText('Bloqueades')).toBeTruthy();
    expect(screen.getByText('Perfiles que ya no verás')).toBeTruthy();
    expect(screen.getByText('Bloqueo geográfico')).toBeTruthy();
    expect(screen.getByText('Oculta tu perfil en zonas específicas')).toBeTruthy();
  });

  it('navega a /profile/blocked al tocar Bloqueades', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    fireEvent.press(screen.getByText('Bloqueades'));

    expect(router.push).toHaveBeenCalledWith('/profile/blocked');
  });

  it('navega a /profile/geo-blocks al tocar Bloqueo geográfico', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    fireEvent.press(screen.getByText('Bloqueo geográfico'));

    expect(router.push).toHaveBeenCalledWith('/profile/geo-blocks');
  });
});
