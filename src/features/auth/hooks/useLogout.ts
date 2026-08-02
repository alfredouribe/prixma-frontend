import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';
import { notificationService } from '../../notifications/services/notificationService';

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      // Best-effort — debe correr mientras el token todavía es válido (antes
      // de clearAuth), pero un fallo aquí nunca debe impedir que la sesión
      // local se cierre.
      await removeDeviceTokenBestEffort();
      await clearAuth();
      setIsLoading(false);
    }
  }

  return { handleLogout, isLoading };
}

async function removeDeviceTokenBestEffort(): Promise<void> {
  try {
    await notificationService.removeDeviceToken();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('useLogout: no se pudo eliminar el device token.', error);
  }
}
