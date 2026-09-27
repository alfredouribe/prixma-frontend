import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';
import { useRegisterPushToken } from '../../notifications/hooks/useRegisterPushToken';
import { useConfigurePurchases } from '../../subscriptions/hooks/useConfigurePurchases';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const { registerPushToken } = useRegisterPushToken();
  const { configurePurchases } = useConfigurePurchases();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(payload: LoginPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(payload);
      await setAuth(user, token);
      // Best-effort, fire-and-forget — el permiso/registro de push ni la
      // configuración de RevenueCat deben retrasar ni bloquear la
      // navegación post-login. `.catch()` es solo defensa extra: ambos
      // hooks ya tragan sus propios errores, esto nunca debería ejecutarse
      // en la práctica.
      registerPushToken().catch(() => {});
      configurePurchases(user.id).catch(() => {});
      // No navegar aquí a mano — `setAuth()` ya dispara el `<Redirect>`
      // declarativo de `app/(auth)/_layout.tsx` (mismo destino, calculado
      // igual). Tener las dos navegaciones (esta imperativa + esa reactiva)
      // corriendo casi al mismo tiempo causaba un crash real de Fabric
      // confirmado en producción vía Sentry (2026-09-27):
      // `RetryableMountingLayerException: Unable to find viewState for tag
      // X` — dos transiciones de pantalla compitiendo por la misma vista.
    } catch (err) {
      setError(extractApiError(err, 'Correo o contraseña incorrectos. Intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { handleLogin, isLoading, error };
}
