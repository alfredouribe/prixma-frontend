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

  it('navega a /profile/subscription al tocar Prixma+', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    fireEvent.press(screen.getByText('Prixma+'));

    expect(router.push).toHaveBeenCalledWith('/profile/subscription');
  });

  it('muestra la entrada de Reportar un problema con su descripción', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    expect(screen.getByText('Reportar un problema')).toBeTruthy();
    expect(screen.getByText('Cuéntanos qué no funciona o compártenos tu idea')).toBeTruthy();
  });

  it('navega a /profile/feedback al tocar Reportar un problema', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    fireEvent.press(screen.getByText('Reportar un problema'));

    expect(router.push).toHaveBeenCalledWith('/profile/feedback');
  });

  it('muestra la entrada de Eliminar cuenta con su descripción, separada del resto', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    expect(screen.getByText('Eliminar cuenta')).toBeTruthy();
    expect(screen.getByText('Elimina tu cuenta y tus datos de forma permanente')).toBeTruthy();
  });

  it('navega a /profile/delete-account al tocar Eliminar cuenta', () => {
    render(<ProfileSettingsMenu verificationStatus="verified" />);

    fireEvent.press(screen.getByText('Eliminar cuenta'));

    expect(router.push).toHaveBeenCalledWith('/profile/delete-account');
  });
});
