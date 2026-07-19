import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { safetyService } from '../services/safetyService';
import { extractApiError } from '../../../lib/extractApiError';
import type { Block } from '../types/safety.types';

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safetyService.getBlocks();
      setBlocks(data);
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

  async function blockUser(blockedId: string): Promise<Block | null> {
    setError(null);
    try {
      const block = await safetyService.blockUser({ blocked_id: blockedId });
      setBlocks((prev) => [block, ...prev]);
      return block;
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return null;
    }
  }

  async function unblockUser(blockId: string): Promise<boolean> {
    const previous = blocks;
    setError(null);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    try {
      await safetyService.unblockUser(blockId);
      return true;
    } catch (err) {
      setBlocks(previous);
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
      return false;
    }
  }

  return { blocks, isLoading, error, blockUser, unblockUser, reload: load };
}
