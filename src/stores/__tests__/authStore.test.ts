import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  status: 'active' as const,
  onboarding_completed: false,
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('authStore', () => {
  describe('setAuth', () => {
    it('saves token to SecureStore and sets isAuthenticated', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().setAuth(mockUser, 'my-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'my-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('clearAuth', () => {
    it('removes token from SecureStore and resets state', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().clearAuth();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('restoreAuth', () => {
    it('reads token from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-token');

      const token = await useAuthStore.getState().restoreAuth();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
      expect(token).toBe('stored-token');
    });

    it('returns null when no token is stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const token = await useAuthStore.getState().restoreAuth();

      expect(token).toBeNull();
    });
  });
});
