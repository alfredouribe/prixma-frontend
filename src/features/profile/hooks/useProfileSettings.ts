import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { profileService } from '../services/profileService';
import { extractApiError } from '../../../lib/extractApiError';
import type { ProfileSettings } from '../types/profile.types';

type ToggleKey = keyof Omit<ProfileSettings, 'id'>;

/**
 * Hook genérico para leer y actualizar `user_settings` (toggle optimista con
 * revert en error). Es genérico sobre cualquier campo boolean de
 * `ProfileSettings` — lo usan tanto PrivacyScreen como NotificationsScreen,
 * cada una con su propio subconjunto de keys a renderizar.
 */
export function useProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getSettings();
      setSettings(data);
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

  async function toggle(key: ToggleKey) {
    if (!settings) return;

    const previousValue = settings[key];
    const nextValue = !previousValue;

    setError(null);
    setSettings({ ...settings, [key]: nextValue });

    try {
      const updated = await profileService.updateSettings({ [key]: nextValue });
      setSettings(updated);
    } catch (err) {
      setSettings({ ...settings, [key]: previousValue });
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  return { settings, isLoading, error, toggle, reload: load };
}
