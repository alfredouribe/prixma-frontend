import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { extractApiError } from '../../../lib/extractApiError';

const GENERIC_ERROR = 'Algo salió mal. Revisa tu conexión e intenta de nuevo.';

/**
 * Elimina la cuenta del usuario autenticado (`DELETE /auth/me`, irreversible
 * desde la perspectiva del usuario — ver backend `AuthController::destroy()`).
 *
 * Al tener éxito, limpia la sesión local exactamente igual que useLogout.ts
 * (`clearAuth()`), y deliberadamente NO navega de forma imperativa después:
 * `clearAuth()` pone `isAuthenticated: false`, lo que ya dispara el
 * `<Redirect href="/(auth)" />` declarativo de `app/(app)/_layout.tsx`.
 * Agregar un `router.replace()`/`router.push()` aquí causaría la misma
 * carrera de navegación (dos transiciones de pantalla compitiendo por la
 * misma vista) que ya produjo un crash real de Fabric, corregido tres veces
 * en este proyecto en useLogin.ts/useRegister.ts/useStepSafety.ts — ver
 * CLAUDE.md, fila Auth (Fase 1), notas de 2026-09-27 y 2026-10-05.
 */
export function useDeleteAccount() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteAccount(): Promise<boolean> {
    setIsDeleting(true);
    setError(null);
    try {
      await authService.deleteAccount();
      await clearAuth();
      return true;
    } catch (err) {
      setError(extractApiError(err, GENERIC_ERROR));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return { handleDeleteAccount, isDeleting, error };
}
