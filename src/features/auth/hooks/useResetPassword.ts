import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';

interface ResetPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export function useResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResetPassword(payload: ResetPayload) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(payload);
      router.replace('/(auth)/login');
    } catch (err) {
      setError(extractApiError(err, 'El enlace expiró. Solicita uno nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleResetPassword, isLoading, error };
}
