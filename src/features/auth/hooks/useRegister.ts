import { useState } from 'react';
import { UseFormSetError } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError, extractFieldErrors } from '../../../lib/extractApiError';
import type { RegisterPayload } from '../types/auth.types';
import type { RegisterFormData } from '../schemas/registerSchema';

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(
    payload: RegisterPayload,
    setFieldError: UseFormSetError<RegisterFormData>,
  ) {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.register(payload);
      await setAuth(user, token);
      router.replace('/(onboarding)/identity');
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setFieldError(field as keyof RegisterFormData, {
            type: 'server',
            message: messages[0],
          });
        });
      }
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleRegister, isLoading, error };
}
