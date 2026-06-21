import { useEffect, useState } from 'react';
import { profileService } from '../services/profileService';
import { extractApiError } from '../../../lib/extractApiError';
import type { PublicProfile } from '../types/profile.types';

export function usePublicProfile(uuid: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    setIsLoading(true);
    setError(null);
    profileService
      .getPublicProfile(uuid)
      .then(setProfile)
      .catch((err) =>
        setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.')),
      )
      .finally(() => setIsLoading(false));
  }, [uuid]);

  return { profile, isLoading, error };
}
