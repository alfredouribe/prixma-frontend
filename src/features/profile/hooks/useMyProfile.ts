import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { profileService } from '../services/profileService';
import { extractApiError } from '../../../lib/extractApiError';
import type { MyProfile } from '../types/profile.types';

export function useMyProfile() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  return { profile, isLoading, error, reload: load };
}
