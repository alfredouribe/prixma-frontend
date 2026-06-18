import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../../auth/services/authService';
import { onboardingService } from '../services/onboardingService';
import { extractApiError } from '../../../lib/extractApiError';
import type { SafetyFormData } from '../schemas/safetySchema';

export function useStepSafety() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SafetyFormData>({
    selfie_verification_enabled: true,
    incognito_mode_enabled: false,
    geo_block_enabled: false,
    reports_enabled: true,
  });

  function toggle(key: keyof SafetyFormData) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveSafety(settings);
      const token = await import('expo-secure-store').then((m) =>
        m.getItemAsync('auth_token'),
      );
      if (token) {
        const user = await authService.getMe();
        await setAuth(user, token);
      }
      router.replace('/(app)');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { settings, toggle, handleSubmit, isLoading, error };
}
