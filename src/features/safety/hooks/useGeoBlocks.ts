import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { safetyService } from '../services/safetyService';
import { extractApiError } from '../../../lib/extractApiError';
import type { CreateGeoBlockPayload, GeoBlock } from '../types/safety.types';

export function useGeoBlocks() {
  const [geoBlocks, setGeoBlocks] = useState<GeoBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safetyService.getGeoBlocks();
      setGeoBlocks(data);
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

  async function createGeoBlock(payload: CreateGeoBlockPayload): Promise<boolean> {
    setError(null);
    try {
      const geoBlock = await safetyService.createGeoBlock(payload);
      setGeoBlocks((prev) => [geoBlock, ...prev]);
      return true;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return false;
    }
  }

  async function deleteGeoBlock(uuid: string): Promise<boolean> {
    const previous = geoBlocks;
    setError(null);
    setGeoBlocks((prev) => prev.filter((g) => g.id !== uuid));
    try {
      await safetyService.deleteGeoBlock(uuid);
      return true;
    } catch (err) {
      setGeoBlocks(previous);
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return false;
    }
  }

  return { geoBlocks, isLoading, error, createGeoBlock, deleteGeoBlock, reload: load };
}
