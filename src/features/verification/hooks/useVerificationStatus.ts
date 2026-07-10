import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { verificationService } from '../services/verificationService';
import { extractApiError } from '../../../lib/extractApiError';
import type { VerificationStatusData } from '../types/verification.types';

export function useVerificationStatus() {
  const [status, setStatus] = useState<VerificationStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await verificationService.getStatus();
      setStatus(data);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { status, isLoading, error, reload: load };
}
