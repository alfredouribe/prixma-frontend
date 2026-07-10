import { render, fireEvent, screen } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import type { MyProfile } from '../../types/profile.types';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../../../lib/api');

const baseProfile: MyProfile = {
  id: 'profile-uuid',
  display_name: 'Kai',
  bio: null,
  city: null,
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
  photos: [],
  statistics: { likes_received: 0, matches_count: 0, events_count: 0 },
};

describe('EditProfileScreen', () => {
  it('muestra el contador de caracteres en el campo bio', async () => {
    render(<EditProfileScreen profile={baseProfile} />);
    expect(await screen.findByText('0/300')).toBeTruthy();
  });

  it('actualiza el contador al escribir en bio', async () => {
    render(<EditProfileScreen profile={baseProfile} />);

    const bioInput = await screen.findByPlaceholderText(
      'Cuéntale a la comunidad quién eres...',
    );
    fireEvent.changeText(bioInput, 'Hola, soy Kai.');

    expect(await screen.findByText('14/300')).toBeTruthy();
  });

  it('muestra el bio inicial si el perfil ya lo tiene', async () => {
    const profile = { ...baseProfile, bio: 'Mi bio actual.' };
    render(<EditProfileScreen profile={profile} />);
    expect(await screen.findByText('14/300')).toBeTruthy();
  });
});
