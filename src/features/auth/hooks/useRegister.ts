import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';
import type { RegisterPayload } from '../types/auth.types';

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(payload: RegisterPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.register(payload);
      await setAuth(user, token);
      router.replace('/(app)');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleRegister, isLoading, error };
}
