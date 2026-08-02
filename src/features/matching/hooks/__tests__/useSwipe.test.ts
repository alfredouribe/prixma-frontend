import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSwipe } from '../useSwipe';
import { matchingService } from '../../services/matchingService';
import type { ExploreProfile } from '../../types/matching.types';

jest.mock('../../services/matchingService');

const mockProfile: ExploreProfile = {
  id: 'profile-uuid',
  display_name: 'Alex',
  age: 28,
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

describe('useSwipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('llama a matchingService.swipe con el id y dirección correctos', async () => {
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: false,
      match_id: null,
    });

    const onSwipeComplete = jest.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeComplete }));

    await act(async () => {
      await result.current.swipe(mockProfile, 'dislike');
    });

    expect(matchingService.swipe).toHaveBeenCalledWith('profile-uuid', 'dislike');
    expect(onSwipeComplete).toHaveBeenCalledTimes(1);
    expect(result.current.matchResult).toBeNull();
  });

  it('muestra el MatchOverlay cuando el servidor responde matched:true', async () => {
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: true,
      match_id: 'match-uuid',
    });

    const { result } = renderHook(() => useSwipe({ onSwipeComplete: jest.fn() }));

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });

    expect(result.current.matchResult).not.toBeNull();
    expect(result.current.matchResult?.matchId).toBe('match-uuid');
    expect(result.current.matchResult?.otherProfile.id).toBe('profile-uuid');
  });

  it('dismissMatch limpia el resultado de match', async () => {
    (matchingService.swipe as jest.Mock).mockResolvedValue({
      swiped: true,
      matched: true,
      match_id: 'match-uuid',
    });

    const { result } = renderHook(() => useSwipe({ onSwipeComplete: jest.fn() }));

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });

    act(() => {
      result.current.dismissMatch();
    });

    expect(result.current.matchResult).toBeNull();
  });

  it('cuando el swipe falla, no llama a onSwipeComplete y sube failedSwipeToken (fuerza remount de la card en vez de quedar invisible)', async () => {
    (matchingService.swipe as jest.Mock).mockRejectedValue(new Error('500'));

    const onSwipeComplete = jest.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeComplete }));

    expect(result.current.failedSwipeToken).toBe(0);

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });

    expect(onSwipeComplete).not.toHaveBeenCalled();
    expect(result.current.failedSwipeToken).toBe(1);
    expect(result.current.isSwiping).toBe(false);
  });

  it('cuando el backend responde 429 (límite de likes del día), muestra el paywall en vez del comportamiento normal de swipe fallido', async () => {
    const limitError = { response: { status: 429, data: { message: 'Límite alcanzado' } } };
    (matchingService.swipe as jest.Mock).mockRejectedValue(limitError);

    const onSwipeComplete = jest.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeComplete }));

    expect(result.current.showLikeLimitPaywall).toBe(false);

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });

    expect(onSwipeComplete).not.toHaveBeenCalled();
    expect(result.current.showLikeLimitPaywall).toBe(true);
    // Igual que cualquier swipe fallido: la card ya voló fuera de pantalla,
    // así que también debe remontarse.
    expect(result.current.failedSwipeToken).toBe(1);
  });

  it('dismissLikeLimitPaywall oculta el paywall', async () => {
    const limitError = { response: { status: 429 } };
    (matchingService.swipe as jest.Mock).mockRejectedValue(limitError);

    const { result } = renderHook(() => useSwipe({ onSwipeComplete: jest.fn() }));

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });
    expect(result.current.showLikeLimitPaywall).toBe(true);

    act(() => {
      result.current.dismissLikeLimitPaywall();
    });

    expect(result.current.showLikeLimitPaywall).toBe(false);
  });

  it('un error que no es 429 no muestra el paywall (comportamiento normal de swipe fallido)', async () => {
    (matchingService.swipe as jest.Mock).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useSwipe({ onSwipeComplete: jest.fn() }));

    await act(async () => {
      await result.current.swipe(mockProfile, 'like');
    });

    expect(result.current.showLikeLimitPaywall).toBe(false);
    expect(result.current.failedSwipeToken).toBe(1);
  });

  it('no ejecuta swipe duplicado mientras está procesando', async () => {
    let resolveSwipe!: (val: unknown) => void;
    (matchingService.swipe as jest.Mock).mockReturnValue(
      new Promise((res) => (resolveSwipe = res)),
    );

    const { result } = renderHook(() => useSwipe({ onSwipeComplete: jest.fn() }));

    act(() => {
      result.current.swipe(mockProfile, 'like');
      result.current.swipe(mockProfile, 'like');
    });

    resolveSwipe({ swiped: true, matched: false, match_id: null });

    await waitFor(() => expect(result.current.isSwiping).toBe(false));

    expect(matchingService.swipe).toHaveBeenCalledTimes(1);
  });
});
