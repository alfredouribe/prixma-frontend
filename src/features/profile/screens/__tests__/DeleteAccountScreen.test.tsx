import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { DeleteAccountScreen } from '../DeleteAccountScreen';
import { useDeleteAccount } from '../../../auth/hooks/useDeleteAccount';

jest.mock('../../../auth/hooks/useDeleteAccount');

function pressConfirmButton(alertSpy: jest.SpyInstance) {
  const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
  const confirmButton = buttons.find((b) => b.text === 'Sí, eliminar');
  confirmButton?.onPress?.();
}

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título y la lista de qué se elimina/conserva', () => {
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount: jest.fn(),
      isDeleting: false,
      error: null,
    });

    render(<DeleteAccountScreen />);

    expect(screen.getByText('Eliminar cuenta')).toBeTruthy();
    expect(screen.getByText('Esta acción es permanente. Al eliminar tu cuenta:')).toBeTruthy();
    expect(
      screen.getByText('Tu perfil, fotos, video y documentos de verificación se borran de forma permanente.'),
    ).toBeTruthy();
    expect(screen.getByText('Se cierra tu sesión en todos tus dispositivos de inmediato.')).toBeTruthy();
    expect(
      screen.getByText(
        'Los mensajes que ya enviaste a otras personas se quedan del lado de elles — igual que cuando bloqueas a alguien.',
      ),
    ).toBeTruthy();
  });

  it('el botón atrás llama a router.back', () => {
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount: jest.fn(),
      isDeleting: false,
      error: null,
    });

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByLabelText('Volver'));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('pedir confirmación antes de llamar a handleDeleteAccount — sin confirmar, no se dispara el borrado', () => {
    const handleDeleteAccount = jest.fn();
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount,
      isDeleting: false,
      error: null,
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByTestId('delete-account-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      '¿Eliminar tu cuenta?',
      'No podrás deshacer esto. Tu cuenta y tus datos se eliminarán de inmediato.',
      expect.arrayContaining([expect.objectContaining({ text: 'Sí, eliminar' })]),
    );
    expect(handleDeleteAccount).not.toHaveBeenCalled();
  });

  it('al confirmar el Alert, llama a handleDeleteAccount', async () => {
    const handleDeleteAccount = jest.fn().mockResolvedValue(true);
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount,
      isDeleting: false,
      error: null,
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByTestId('delete-account-button'));
    pressConfirmButton(alertSpy);

    await waitFor(() => expect(handleDeleteAccount).toHaveBeenCalledTimes(1));
  });

  it('si falla el borrado, muestra el error genérico en un Alert', async () => {
    const handleDeleteAccount = jest.fn().mockResolvedValue(false);
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount,
      isDeleting: false,
      error: 'Algo salió mal. Revisa tu conexión e intenta de nuevo.',
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByTestId('delete-account-button'));
    pressConfirmButton(alertSpy);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('', 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'),
    );
  });

  it('mientras isDeleting, el botón de eliminar está deshabilitado', () => {
    (useDeleteAccount as jest.Mock).mockReturnValue({
      handleDeleteAccount: jest.fn(),
      isDeleting: true,
      error: null,
    });

    render(<DeleteAccountScreen />);

    expect(screen.getByTestId('delete-account-button').props.accessibilityState?.disabled).toBe(true);
  });
});
