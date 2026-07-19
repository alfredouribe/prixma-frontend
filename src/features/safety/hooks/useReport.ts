import { useState } from 'react';
import { safetyService } from '../services/safetyService';
import { extractApiError } from '../../../lib/extractApiError';
import type { ReportReason } from '../types/safety.types';

export function useReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReport(
    reportedId: string,
    reason: ReportReason,
    description?: string | null,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await safetyService.reportUser({
        reported_id: reportedId,
        reason,
        description: description || null,
      });
      return true;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { submitReport, isLoading, error };
}
