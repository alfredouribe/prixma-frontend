import { renderHook, act } from '@testing-library/react-native';
import { useEditProfile } from '../useEditProfile';
import { profileService } from '../../services/profileService';
import type { MyProfile } from '../../types/profile.types';

jest.mock('../../services/profileService');
jest.mock('expo-image-picker');

const mockProfile: MyProfile = {
  id: 'profile-uuid',
  display_name: 'Kai',
  bio: null,
  city: null,
  latitude: null,
  longitude: null,
  intention: null,
  custom_gender_identity: null,
  custom_orientation: null,
  custom_pronouns: null,
  custom_interests: null,
  photo_url: null,
  video_url: null,
  video_processed: false,
  onboarding_step: 6,
  onboarding_completed: true,
  verification_status: 'unverified',
  gender_identities: [],
  orientations: [],
  pronouns: [],
  interests: [],
  photos: [
    { id: 'photo-1', url: 'https://s3.example.com/a.jpg', position: 1 },
    { id: 'photo-2', url: 'https://s3.example.com/b.jpg', position: 2 },
  ],
  statistics: { likes_received: 0, matches_count: 0, events_count: 0 },
};

describe('useEditProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (profileService.reorderPhotos as jest.Mock).mockResolvedValue(undefined);
  });

  it('llama a reorderPhotos al cambiar el orden de las fotos', async () => {
    const { result } = renderHook(() => useEditProfile(mockProfile));

    await act(async () => {
      await result.current.handleReorderPhotos(['photo-2', 'photo-1']);
    });

    expect(profileService.reorderPhotos).toHaveBeenCalledWith(['photo-2', 'photo-1']);
  });

  it('actualiza el orden local de fotos optimistamente', async () => {
    const { result } = renderHook(() => useEditProfile(mockProfile));

    await act(async () => {
      await result.current.handleReorderPhotos(['photo-2', 'photo-1']);
    });

    expect(result.current.photos[0].id).toBe('photo-2');
    expect(result.current.photos[1].id).toBe('photo-1');
  });
});
