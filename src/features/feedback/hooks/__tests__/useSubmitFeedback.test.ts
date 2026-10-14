import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useSubmitFeedback } from '../useSubmitFeedback';
import { feedbackService } from '../../services/feedbackService';

jest.mock('../../services/feedbackService');
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.2.3' } },
}));

const expectedPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

describe('useSubmitFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('envía un bug exitosamente con app_version y platform agregados automáticamente', async () => {
    (feedbackService.submit as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitFeedback());

    act(() => {
      result.current.form.setValue('type', 'bug');
      result.current.form.setValue('message', 'La app se cierra al abrir el chat');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(feedbackService.submit).toHaveBeenCalledWith({
      type: 'bug',
      message: 'La app se cierra al abrir el chat',
      app_version: '1.2.3',
      platform: expectedPlatform,
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('envía un comment exitosamente', async () => {
    (feedbackService.submit as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitFeedback());

    act(() => {
      result.current.form.setValue('type', 'comment');
      result.current.form.setValue('message', 'Sería genial tener modo oscuro automático');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(feedbackService.submit).toHaveBeenCalledWith({
      type: 'comment',
      message: 'Sería genial tener modo oscuro automático',
      app_version: '1.2.3',
      platform: expectedPlatform,
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it('no envía nada ni marca éxito si el mensaje está vacío (validación de Zod)', async () => {
    const { result } = renderHook(() => useSubmitFeedback());

    act(() => {
      result.current.form.setValue('message', '');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(feedbackService.submit).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);

    // La validación de Zod bloquea el envío antes de que `onSubmit` corra
    // (por eso `feedbackService.submit` nunca se llama arriba) — se
    // confirma aparte, por fuera del hook, que el error expuesto es el
    // mensaje exacto de brand/copies.md (ver `form.trigger` para forzar que
    // RHF resuelva el resolver de Zod de forma síncrona en el assert).
    await act(async () => {
      await result.current.form.trigger('message');
    });
    expect(result.current.form.getFieldState('message').error?.message).toBe(
      'Escribe un mensaje antes de enviar.',
    );
  });

  it('muestra el mensaje de error genérico si la llamada de red falla', async () => {
    (feedbackService.submit as jest.Mock).mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useSubmitFeedback());

    act(() => {
      result.current.form.setValue('message', 'No carga mi perfil');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(result.current.isSuccess).toBe(false);
  });

  it('usa el mensaje de error del backend cuando viene en la respuesta', async () => {
    (feedbackService.submit as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Algo salió mal del lado del servidor.' } },
    });
    const { result } = renderHook(() => useSubmitFeedback());

    act(() => {
      result.current.form.setValue('message', 'Un mensaje válido cualquiera');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe('Algo salió mal del lado del servidor.');
  });
});
