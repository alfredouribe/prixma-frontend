import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useExploreQueue } from '../useExploreQueue';
import { matchingService } from '../../services/matchingService';
import type { ExploreProfile } from '../../types/matching.types';

jest.mock('../../services/matchingService');

function makeProfile(id: string): ExploreProfile {
  return {
    id,
    display_name: `User ${id}`,
    age: 25,
    pronouns: [],
    gender_identities: [],
    orientations: [],
    city: 'CDMX',
    bio: null,
    intention: 'friendship',
    is_verified: false,
    has_video: false,
    interests: [],
    photos: [],
  };
}

const batch25 = Array.from({ length: 25 }, (_, i) => makeProfile(`profile-${i}`));

describe('useExploreQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga el primer batch al montar', async () => {
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(batch25);

    const { result } = renderHook(() => useExploreQueue());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentProfile?.id).toBe('profile-0');
    expect(matchingService.getExploreQueue).toHaveBeenCalledTimes(1);
  });

  it('muestra isEmpty cuando el servidor devuelve un array vacío', async () => {
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useExploreQueue());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.currentProfile).toBeNull();
  });

  it('carga el siguiente batch cuando quedan 5 perfiles restantes', async () => {
    const secondBatch = Array.from({ length: 10 }, (_, i) => makeProfile(`second-${i}`));

    (matchingService.getExploreQueue as jest.Mock)
      .mockResolvedValueOnce(batch25)
      .mockResolvedValueOnce(secondBatch);

    const { result } = renderHook(() => useExploreQueue());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Advance to index 20 (queue.length - 5 = 25 - 5 = 20)
    for (let i = 0; i < 20; i++) {
      act(() => result.current.advance());
    }

    await waitFor(() =>
      expect(matchingService.getExploreQueue).toHaveBeenCalledTimes(2),
    );
  });

  it('advance mueve al siguiente perfil', async () => {
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(batch25);

    const { result } = renderHook(() => useExploreQueue());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.advance());

    expect(result.current.currentProfile?.id).toBe('profile-1');
  });
});
