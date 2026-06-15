import { renderHook, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useLogin } from '../useLogin';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../../../stores/authStore';

jest.mock('../../services/authService');
jest.mock('expo-router');

const mockUser = {
  id: 'uuid-1',
  email: 'user@example.com',
  status: 'active' as const,
  onboarding_completed: false,
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false });
  (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('useLogin', () => {
  it('stores token in expo-secure-store on successful login', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      token: 'test-token-abc',
    });

    const { result } = await renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleLogin({ email: 'user@example.com', password: 'password123' });
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'test-token-abc');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('sets error message on failed login', async () => {
    (authService.login as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Correo o contraseña incorrectos' } },
    });

    const { result } = await renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleLogin({ email: 'user@example.com', password: 'wrong' });
    });

    expect(result.current.error).toBe('Correo o contraseña incorrectos');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
