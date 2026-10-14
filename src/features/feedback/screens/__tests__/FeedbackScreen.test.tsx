import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { FeedbackScreen } from '../FeedbackScreen';
import { feedbackService } from '../../services/feedbackService';

jest.mock('../../services/feedbackService');
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.3' } },
}));

describe('FeedbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título, subtítulo y las 2 opciones de tipo', () => {
    render(<FeedbackScreen />);

    expect(screen.getByText('Reportar un problema')).toBeTruthy();
    expect(screen.getByText('Tu opinión nos ayuda a mejorar Prixma.')).toBeTruthy();
    expect(screen.getByText('Bug')).toBeTruthy();
    expect(screen.getByText('Comentario')).toBeTruthy();
  });

  it('el botón Enviar está deshabilitado mientras el mensaje está vacío (no envía nada al presionarlo)', async () => {
    render(<FeedbackScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('feedback-submit-btn'));
    });

    expect(feedbackService.submit).not.toHaveBeenCalled();
  });

  it('envía un bug exitosamente y muestra la confirmación', async () => {
    (feedbackService.submit as jest.Mock).mockResolvedValue(undefined);
    render(<FeedbackScreen />);

    fireEvent.changeText(
      screen.getByTestId('feedback-message-input'),
      'La app se cierra al abrir el chat',
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('feedback-submit-btn'));
    });

    await waitFor(() => {
      expect(feedbackService.submit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'bug', message: 'La app se cierra al abrir el chat' }),
      );
    });
    expect(await screen.findByText('¡Gracias por tu mensaje!')).toBeTruthy();
    expect(screen.getByText('Lo revisaremos pronto.')).toBeTruthy();
  });

  it('envía un comment exitosamente tras seleccionar esa opción', async () => {
    (feedbackService.submit as jest.Mock).mockResolvedValue(undefined);
    render(<FeedbackScreen />);

    fireEvent.press(screen.getByTestId('feedback-type-comment'));
    fireEvent.changeText(
      screen.getByTestId('feedback-message-input'),
      'Sería genial tener modo oscuro automático',
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('feedback-submit-btn'));
    });

    await waitFor(() => {
      expect(feedbackService.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'comment',
          message: 'Sería genial tener modo oscuro automático',
        }),
      );
    });
    expect(await screen.findByText('¡Gracias por tu mensaje!')).toBeTruthy();
  });

  it('muestra el mensaje de error genérico si la llamada de red falla', async () => {
    (feedbackService.submit as jest.Mock).mockRejectedValue(new Error('network error'));
    render(<FeedbackScreen />);

    fireEvent.changeText(screen.getByTestId('feedback-message-input'), 'No carga mi perfil');

    await act(async () => {
      fireEvent.press(screen.getByTestId('feedback-submit-btn'));
    });

    expect(
      await screen.findByText('Algo salió mal. Revisa tu conexión e intenta de nuevo.'),
    ).toBeTruthy();
    expect(screen.queryByText('¡Gracias por tu mensaje!')).toBeNull();
  });

  it('el botón "Volver a mi perfil" navega hacia atrás tras confirmar el envío', async () => {
    (feedbackService.submit as jest.Mock).mockResolvedValue(undefined);
    render(<FeedbackScreen />);

    fireEvent.changeText(screen.getByTestId('feedback-message-input'), 'Todo funciona bien');

    await act(async () => {
      fireEvent.press(screen.getByTestId('feedback-submit-btn'));
    });

    const backButton = await screen.findByTestId('feedback-confirm-back-btn');
    fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
