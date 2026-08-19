import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLikers } from '../useLikers';
import { matchingService } from '../../../matching/services/matchingService';
import type { ExploreProfile } from '../../../matching/types/matching.types';

jest.mock('../../../matching/services/matchingService');

const mockLiker: ExploreProfile = {
  id: 'liker-uuid',
  display_name: 'Nubia',
  age: 26,
  pronouns: ['elle'],
  gender_identities: ['non_binary'],
  orientations: ['queer'],
  city: 'CDMX',
  bio: null,
  intention: 'friendship',
  is_verified: true,
  has_video: false,
  interests: [],
  photos: [{ id: 'p1', url: 'https://s3.example.com/photo.jpg', position: 1 }],
};

describe('useLikers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga la lista de quién dio like', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);

    const { result } = renderHook(() => useLikers());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(matchingService.getLikers).toHaveBeenCalledTimes(1);
    expect(result.current.likers).toEqual([mockLiker]);
    expect(result.current.needsUpgrade).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cuando el backend responde 403, expone needsUpgrade en vez de un error genérico', async () => {
    (matchingService.getLikers as jest.Mock).mockRejectedValue({
      response: { status: 403, data: { message: 'Necesitas Prixma+ para ver quién te dio like.' } },
    });

    const { result } = renderHook(() => useLikers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.needsUpgrade).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.likers).toEqual([]);
  });

  it('un error que no es 403 se expone como error genérico, no como needsUpgrade', async () => {
    (matchingService.getLikers as jest.Mock).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useLikers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.needsUpgrade).toBe(false);
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });

  it('refresh vuelve a pedir la lista', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);

    const { result } = renderHook(() => useLikers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(matchingService.getLikers).toHaveBeenCalledTimes(2));
  });

  it('likeBack exitoso sin match: quita al perfil de la lista y no setea matchResult', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: false,
      match_id: null,
    });

    const { result } = renderHook(() => useLikers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.likeBack(mockLiker);
    });

    expect(matchingService.swipe).toHaveBeenCalledWith('liker-uuid', 'like');
    expect(result.current.likers).toEqual([]);
    expect(result.current.matchResult).toBeNull();
    expect(result.current.likingProfileId).toBeNull();
  });

  it('likeBack exitoso con match: quita al perfil de la lista y setea matchResult (como el like inverso ya existía)', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: true,
      match_id: 'match-uuid',
    });

    const { result } = renderHook(() => useLikers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.likeBack(mockLiker);
    });

    expect(result.current.likers).toEqual([]);
    expect(result.current.matchResult).toEqual({ matchId: 'match-uuid', otherProfile: mockLiker });
  });

  it('dismissMatch limpia el resultado de match', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: true,
      match_id: 'match-uuid',
    });

    const { result } = renderHook(() => useLikers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.likeBack(mockLiker);
    });
    expect(result.current.matchResult).not.toBeNull();

    act(() => {
      result.current.dismissMatch();
    });

    expect(result.current.matchResult).toBeNull();
  });

  it('likeBack fallido: el perfil se queda en la lista y se expone likeError', async () => {
    (matchingService.getLikers as jest.Mock).mockResolvedValue([mockLiker]);
    (matchingService.swipe as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Algo salió mal.' } },
    });

    const { result } = renderHook(() => useLikers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.likeBack(mockLiker);
    });

    expect(result.current.likers).toEqual([mockLiker]);
    expect(result.current.matchResult).toBeNull();
    expect(result.current.likeError).toBe('Algo salió mal.');
    expect(result.current.likingProfileId).toBeNull();
  });
});
