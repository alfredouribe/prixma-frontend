import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../stores/authStore';
import api from '../api';

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('api interceptors', () => {
  it('attaches Authorization header when token is present', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('bearer-token');

    const handlers = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }> }>;
      }
    ).handlers;
    const { fulfilled } = handlers[handlers.length - 1];

    const config = { headers: {} as Record<string, string> };
    const result = await fulfilled(config);

    expect(result.headers['Authorization']).toBe('Bearer bearer-token');
  });

  it('calls clearAuth and rejects on 401 response', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'u@e.com',
        status: 'active',
        onboarding_completed: false,
        email_verified_at: null,
        created_at: '',
      },
      isAuthenticated: true,
    });

    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{ rejected: (err: unknown) => Promise<never> }>;
      }
    ).handlers;
    const { rejected } = handlers[handlers.length - 1];

    const error = { response: { status: 401 } };
    await expect(rejected(error)).rejects.toEqual(error);

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
