import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';
import { useRegisterPushToken } from '../../notifications/hooks/useRegisterPushToken';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { registerPushToken } = useRegisterPushToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(payload: LoginPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(payload);
      await setAuth(user, token);
      // Best-effort, fire-and-forget — el permiso/registro de push nunca
      // debe retrasar ni bloquear la navegación post-login. `.catch()` es
      // solo defensa extra: `useRegisterPushToken` ya traga sus propios
      // errores, esto nunca debería ejecutarse en la práctica.
      registerPushToken().catch(() => {});
      router.replace(user.onboarding_completed ? '/(app)/(tabs)' : '/(onboarding)/identity');
    } catch (err) {
      setError(extractApiError(err, 'Correo o contraseña incorrectos. Intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleLogin, isLoading, error };
}
