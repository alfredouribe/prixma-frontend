import { useCallback, useEffect, useState } from 'react';
import { matchingService } from '../services/matchingService';
import type { MatchingPreferences, MatchingPreferencesUpdate } from '../types/matching.types';

export function useMatchingPreferences() {
  const [preferences, setPreferences] = useState<MatchingPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    matchingService
      .getPreferences()
      .then(setPreferences)
      .finally(() => setIsLoading(false));
  }, []);

  const updatePreferences = useCallback(async (data: MatchingPreferencesUpdate) => {
    setIsSaving(true);
    try {
      const updated = await matchingService.updatePreferences(data);
      setPreferences(updated);
      return updated;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { preferences, isLoading, isSaving, updatePreferences };
}
