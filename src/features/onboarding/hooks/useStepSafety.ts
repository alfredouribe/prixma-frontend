import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../../auth/services/authService';
import { onboardingService } from '../services/onboardingService';
import { extractApiError } from '../../../lib/extractApiError';
import type { SafetyFormData } from '../schemas/safetySchema';

export function useStepSafety() {
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
        // No navegar aquí a mano — ver la nota en useLogin.ts/useRegister.ts.
        // `setAuth()` ya actualiza `user.onboarding_completed` a `true`, y
        // `app/(onboarding)/_layout.tsx` reacciona con un `<Redirect>`
        // declarativo a `/(app)/(tabs)`. Tener las dos navegaciones (esta
        // imperativa + esa reactiva) corriendo casi al mismo tiempo es el
        // mismo patrón que causó el crash real de Fabric confirmado por
        // Sentry en login/registro (2026-09-27) — este hook se quedó sin
        // corregir en esa ronda porque solo se revisaron login/registro, y
        // un usuario lo confirmó de nuevo en vivo (2026-10-05) justo al
        // completar este último paso: `NullPointerException` dentro del
        // propio `expo-dev-launcher` al mostrar su pantalla de error tras el
        // crash nativo real (breadcrumbs de Sentry: POST .../step/safety
        // 200 OK → MainActivity paused → DevLauncherErrorActivity).
        await setAuth(user, token);
      }
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { settings, toggle, handleSubmit, isLoading, error };
}
