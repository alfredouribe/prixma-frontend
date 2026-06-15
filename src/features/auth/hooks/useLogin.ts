import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(payload: LoginPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(payload);
      await setAuth(user, token);
      router.replace('/(app)');
    } catch (err) {
      setError(extractApiError(err, 'Correo o contraseña incorrectos. Intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleLogin, isLoading, error };
}
