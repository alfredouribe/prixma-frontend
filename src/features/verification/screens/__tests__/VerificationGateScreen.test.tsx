import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { VerificationGateScreen } from '../VerificationGateScreen';
import { profileService } from '../../../profile/services/profileService';
import type { MyProfile, ProfileVerificationStatus } from '../../../profile/types/profile.types';

jest.mock('../../../profile/services/profileService');

jest.mock('../../../matching/screens/ExploreScreen', () => {
  const { Text } = require('react-native');
  return { ExploreScreen: () => <Text testID="explore-screen">Explore</Text> };
});

jest.mock('../VerificationTeaserScreen', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    VerificationTeaserScreen: ({ onVerifyNow }: { onVerifyNow: () => void }) => (
      <TouchableOpacity testID="verification-teaser-screen" onPress={onVerifyNow}>
        <Text>Teaser</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../UploadDocumentScreen', () => {
  const { Text } = require('react-native');
  return { UploadDocumentScreen: () => <Text testID="upload-document-screen">Upload</Text> };
});

jest.mock('../VerificationStatusScreen', () => {
  const { Text } = require('react-native');
  return { VerificationStatusScreen: () => <Text testID="verification-status-screen">Status</Text> };
});

function buildProfile(verification_status: ProfileVerificationStatus): MyProfile {
  return {
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
    verification_status,
    gender_identities: [],
    orientations: [],
    pronouns: [],
    interests: [],
    photos: [],
    statistics: { likes_received: 0, matches_count: 0, events_count: 0 },
  };
}

describe('VerificationGateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloquea Explorar y muestra el teaser (no el formulario directamente) cuando el perfil no está verificado', async () => {
    (profileService.getMyProfile as jest.Mock).mockResolvedValue(buildProfile('unverified'));

    render(<VerificationGateScreen />);

    await waitFor(() => expect(screen.getByTestId('verification-teaser-screen')).toBeTruthy());
    expect(screen.queryByTestId('upload-document-screen')).toBeNull();
    expect(screen.queryByTestId('explore-screen')).toBeNull();
  });

  it('navega del teaser al formulario de subida al tocar "Verificar ahora"', async () => {
    (profileService.getMyProfile as jest.Mock).mockResolvedValue(buildProfile('unverified'));

    render(<VerificationGateScreen />);

    const teaser = await screen.findByTestId('verification-teaser-screen');
    fireEvent.press(teaser);

    await waitFor(() => expect(screen.getByTestId('upload-document-screen')).toBeTruthy());
    expect(screen.queryByTestId('verification-teaser-screen')).toBeNull();
  });

  it('bloquea Explorar y muestra la pantalla de estado cuando la solicitud está pendiente', async () => {
    (profileService.getMyProfile as jest.Mock).mockResolvedValue(buildProfile('pending'));

    render(<VerificationGateScreen />);

    await waitFor(() => expect(screen.getByTestId('verification-status-screen')).toBeTruthy());
    expect(screen.queryByTestId('explore-screen')).toBeNull();
  });

  it('bloquea Explorar y muestra la pantalla de estado cuando la solicitud fue rechazada', async () => {
    (profileService.getMyProfile as jest.Mock).mockResolvedValue(buildProfile('rejected'));

    render(<VerificationGateScreen />);

    await waitFor(() => expect(screen.getByTestId('verification-status-screen')).toBeTruthy());
    expect(screen.queryByTestId('explore-screen')).toBeNull();
  });

  it('permite el acceso a Explorar solo cuando el perfil está verificado', async () => {
    (profileService.getMyProfile as jest.Mock).mockResolvedValue(buildProfile('verified'));

    render(<VerificationGateScreen />);

    await waitFor(() => expect(screen.getByTestId('explore-screen')).toBeTruthy());
    expect(screen.queryByTestId('verification-teaser-screen')).toBeNull();
    expect(screen.queryByTestId('upload-document-screen')).toBeNull();
    expect(screen.queryByTestId('verification-status-screen')).toBeNull();
  });
});
