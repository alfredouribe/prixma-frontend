import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import * as Sentry from '@sentry/react-native';
import { useEditProfile } from '../useEditProfile';
import { profileService } from '../../services/profileService';
import type { MyProfile } from '../../types/profile.types';

jest.mock('../../services/profileService');
jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

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
  interested_in_all_genders: false,
  interested_genders: [],
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
    (manipulateAsync as jest.Mock).mockResolvedValue({ uri: 'file://photo-compressed.jpg' });
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

  it('prefija "a quién te gustaría conocer" desde el GET cuando el perfil ya tiene identidades específicas guardadas', () => {
    const profile: MyProfile = {
      ...mockProfile,
      interested_in_all_genders: false,
      interested_genders: [{ id: 'g2', slug: 'trans_woman', label: 'Mujer trans' }],
    };
    const { result } = renderHook(() => useEditProfile(profile));

    expect(result.current.form.getValues('interested_in_all_genders')).toBe(false);
    expect(result.current.form.getValues('interested_gender_identity_ids')).toEqual(['g2']);
  });

  it('prefija "Todes / sin preferencia" desde el GET cuando el perfil lo tiene marcado', () => {
    const profile: MyProfile = {
      ...mockProfile,
      interested_in_all_genders: true,
      interested_genders: [],
    };
    const { result } = renderHook(() => useEditProfile(profile));

    expect(result.current.form.getValues('interested_in_all_genders')).toBe(true);
    expect(result.current.form.getValues('interested_gender_identity_ids')).toEqual([]);
  });

  it('reporta el error a Sentry con la fuente "camera" cuando falla la subida de una foto tomada con la cámara', async () => {
    const uploadError = new Error('Network request failed');
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      // El primer botón definido en el hook es "Cámara"
      buttons?.[0]?.onPress?.();
    });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://camera-photo.jpg' }],
    });
    (profileService.uploadPhoto as jest.Mock).mockRejectedValue(uploadError);

    const { result } = renderHook(() => useEditProfile(mockProfile));

    await act(async () => {
      await result.current.handlePickPhoto();
    });

    await waitFor(() => expect(result.current.photoError).not.toBeNull());
    expect(Sentry.captureException).toHaveBeenCalledWith(
      uploadError,
      { tags: { feature: 'profile_photo_upload', pick_source: 'camera' } },
    );
    expect(result.current.photoError).toBe(
      'No pudimos subir tu foto desde la cámara. Intenta de nuevo o selecciona una desde tu galería.',
    );
  });

  it('reporta el error a Sentry con la fuente "library" cuando falla la subida de una foto elegida de la galería', async () => {
    const uploadError = new Error('Network request failed');
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      // El segundo botón definido en el hook es "Galería"
      buttons?.[1]?.onPress?.();
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://library-photo.jpg' }],
    });
    (profileService.uploadPhoto as jest.Mock).mockRejectedValue(uploadError);

    const { result } = renderHook(() => useEditProfile(mockProfile));

    await act(async () => {
      await result.current.handlePickPhoto();
    });

    await waitFor(() => expect(result.current.photoError).not.toBeNull());
    expect(Sentry.captureException).toHaveBeenCalledWith(
      uploadError,
      { tags: { feature: 'profile_photo_upload', pick_source: 'library' } },
    );
    expect(result.current.photoError).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });

  it('reporta el error a Sentry con el contexto del video cuando falla la subida del video', async () => {
    const uploadError = new Error('Network request failed');
    const videoAsset = {
      uri: 'file://video.mov',
      mimeType: 'video/quicktime',
      fileSize: 12345,
      width: 1920,
      height: 1080,
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [videoAsset],
    });
    (profileService.uploadVideo as jest.Mock).mockRejectedValue(uploadError);

    const { result } = renderHook(() => useEditProfile(mockProfile));

    await act(async () => {
      await result.current.handlePickVideo();
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      uploadError,
      {
        tags: { feature: 'profile_video_upload' },
        extra: {
          mimeType: videoAsset.mimeType,
          fileSize: videoAsset.fileSize,
          width: videoAsset.width,
          height: videoAsset.height,
        },
      },
    );
    expect(result.current.videoState).toBe('error');
  });
});
