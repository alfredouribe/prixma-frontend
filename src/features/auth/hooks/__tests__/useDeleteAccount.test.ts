import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useDeleteAccount } from '../useDeleteAccount';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../../../stores/authStore';

jest.mock('../../services/authService');

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: true });
});

describe('useDeleteAccount', () => {
  it('llama a authService.deleteAccount() y limpia la sesión local al tener éxito', async () => {
    (authService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAccount());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleDeleteAccount();
    });

    expect(success).toBe(true);
    expect(authService.deleteAccount).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('no navega de forma imperativa tras limpiar la sesión — el <Redirect> declarativo del guard se encarga', async () => {
    (authService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.handleDeleteAccount();
    });

    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('en error de red, devuelve false y expone el mensaje genérico sin limpiar la sesión', async () => {
    (authService.deleteAccount as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useDeleteAccount());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleDeleteAccount();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('usa el mensaje del backend cuando la respuesta de error lo incluye', async () => {
    (authService.deleteAccount as jest.Mock).mockRejectedValue({
      response: { data: { message: 'No se pudo eliminar la cuenta.' } },
    });

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.handleDeleteAccount();
    });

    expect(result.current.error).toBe('No se pudo eliminar la cuenta.');
  });

  it('expone isDeleting mientras la petición está en curso', async () => {
    let resolveDelete: () => void = () => {};
    (authService.deleteAccount as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }),
    );

    const { result } = renderHook(() => useDeleteAccount());

    let pending: Promise<boolean>;
    act(() => {
      pending = result.current.handleDeleteAccount();
    });

    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      resolveDelete();
      await pending;
    });

    expect(result.current.isDeleting).toBe(false);
  });
});
