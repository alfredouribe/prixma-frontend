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
