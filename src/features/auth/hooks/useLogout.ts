import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { authService } from '../services/authService';

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      await clearAuth();
      setIsLoading(false);
    }
  }

  return { handleLogout, isLoading };
}
