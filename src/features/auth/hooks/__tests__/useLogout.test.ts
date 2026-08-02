import { renderHook, act } from '@testing-library/react-native';
import { useLogout } from '../useLogout';
import { authService } from '../../services/authService';
import { notificationService } from '../../../notifications/services/notificationService';
import { useAuthStore } from '../../../../stores/authStore';

jest.mock('../../services/authService');
jest.mock('../../../notifications/services/notificationService');

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false });
  (authService.logout as jest.Mock).mockResolvedValue(undefined);
  (notificationService.removeDeviceToken as jest.Mock).mockResolvedValue(undefined);
});

describe('useLogout', () => {
  it('elimina el device token antes de limpiar la sesión local', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(notificationService.removeDeviceToken).toHaveBeenCalledTimes(1);
  });

  it('sigue cerrando sesión aunque falle la eliminación del device token (best-effort)', async () => {
    (notificationService.removeDeviceToken as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await expect(result.current.handleLogout()).resolves.toBeUndefined();
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('propaga el error de authService.logout() tras intentar limpiar igual', async () => {
    (authService.logout as jest.Mock).mockRejectedValue(new Error('logout failed'));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await expect(result.current.handleLogout()).rejects.toThrow('logout failed');
    });

    expect(notificationService.removeDeviceToken).toHaveBeenCalledTimes(1);
  });
});
