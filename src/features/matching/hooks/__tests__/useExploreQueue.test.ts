import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useExploreQueue } from '../useExploreQueue';
import { matchingService } from '../../services/matchingService';
import type { ExploreProfile, ExploreQueueItem } from '../../types/matching.types';

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

// Helper: extrae el id del perfil de un item de la cola, o `null` si es un
// ad (o si no hay item) — evita repetir el narrowing de `ExploreQueueItem`
// en cada aserción.
function profileId(item: ExploreQueueItem | null): string | null {
  return item?.kind === 'profile' ? item.profile.id : null;
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

    expect(profileId(result.current.currentItem)).toBe('profile-0');
    expect(matchingService.getExploreQueue).toHaveBeenCalledTimes(1);
  });

  it('muestra isEmpty cuando el servidor devuelve un array vacío', async () => {
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useExploreQueue());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.currentItem).toBeNull();
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

  it('no duplica perfiles que ya están en la cola al hacer loadMore (bug: quedaba en negro al agotar perfiles)', async () => {
    // El backend excluye perfiles ya swipeados, no los ya mostrados-pero-
    // no-swipeados-todavía — el batch del prefetch puede traer de vuelta
    // perfiles que ya están en la cola local sin haber sido swipeados aún.
    const overlappingBatch = [
      makeProfile('profile-20'),
      makeProfile('profile-21'),
      makeProfile('profile-22'),
      makeProfile('profile-23'),
      makeProfile('profile-24'),
      makeProfile('new-1'),
      makeProfile('new-2'),
    ];

    (matchingService.getExploreQueue as jest.Mock)
      .mockResolvedValueOnce(batch25)
      .mockResolvedValueOnce(overlappingBatch);

    const { result } = renderHook(() => useExploreQueue());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    for (let i = 0; i < 20; i++) {
      act(() => result.current.advance());
    }

    await waitFor(() => expect(matchingService.getExploreQueue).toHaveBeenCalledTimes(2));

    // Avanza hasta el final de la cola original (25) y confirma que los
    // siguientes perfiles son los 2 realmente nuevos, no duplicados.
    for (let i = 0; i < 5; i++) {
      act(() => result.current.advance());
    }

    expect(profileId(result.current.currentItem)).toBe('new-1');
    act(() => result.current.advance());
    expect(profileId(result.current.currentItem)).toBe('new-2');
    act(() => result.current.advance());
    expect(result.current.isEmpty).toBe(true);
  });

  it('advance mueve al siguiente perfil', async () => {
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(batch25);

    const { result } = renderHook(() => useExploreQueue());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.advance());

    expect(profileId(result.current.currentItem)).toBe('profile-1');
  });

  // --- Premium: card de ads intercalada (features/premium/specs/plan.md) ---

  it('intercala una card de ad cada `adInterval` perfiles reales', async () => {
    const profiles = Array.from({ length: 12 }, (_, i) => makeProfile(`p${i + 1}`));
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(profiles);

    const { result } = renderHook(() => useExploreQueue({ isPremium: false, adInterval: 5 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Orden esperado: p1..p5, AD, p6..p10, AD, p11, p12
    const expectedKinds = [
      'profile', 'profile', 'profile', 'profile', 'profile', 'ad',
      'profile', 'profile', 'profile', 'profile', 'profile', 'ad',
      'profile', 'profile',
    ];

    for (const expectedKind of expectedKinds) {
      expect(result.current.currentItem?.kind).toBe(expectedKind);
      act(() => result.current.advance());
    }
  });

  it('nunca coloca una ad antes del primer perfil real', async () => {
    const profiles = Array.from({ length: 3 }, (_, i) => makeProfile(`p${i + 1}`));
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(profiles);

    const { result } = renderHook(() => useExploreQueue({ isPremium: false, adInterval: 5 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentItem?.kind).toBe('profile');
  });

  it('no intercala ads si el usuario es premium', async () => {
    const profiles = Array.from({ length: 12 }, (_, i) => makeProfile(`p${i + 1}`));
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(profiles);

    const { result } = renderHook(() => useExploreQueue({ isPremium: true, adInterval: 5 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    for (let i = 0; i < 12; i++) {
      expect(result.current.currentItem?.kind).toBe('profile');
      act(() => result.current.advance());
    }
  });

  it('no intercala ads si adInterval es null (ajustes de premium sin cargar)', async () => {
    const profiles = Array.from({ length: 6 }, (_, i) => makeProfile(`p${i + 1}`));
    (matchingService.getExploreQueue as jest.Mock).mockResolvedValue(profiles);

    const { result } = renderHook(() => useExploreQueue({ isPremium: false, adInterval: null }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    for (let i = 0; i < 6; i++) {
      expect(result.current.currentItem?.kind).toBe('profile');
      act(() => result.current.advance());
    }
  });
});
