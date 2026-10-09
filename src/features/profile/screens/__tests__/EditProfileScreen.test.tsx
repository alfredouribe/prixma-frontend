import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import { onboardingService } from '../../../onboarding/services/onboardingService';
import type { MyProfile } from '../../types/profile.types';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../../../lib/api');
jest.mock('../../../onboarding/services/onboardingService');

const GENDER_ITEM_1 = { id: 'g1', slug: 'non_binary', label: 'No binarie' };
const GENDER_ITEM_2 = { id: 'g2', slug: 'trans_woman', label: 'Mujer trans' };

function mockCatalogs() {
  (onboardingService.getCatalogs as jest.Mock).mockResolvedValue({
    gender_identities: [GENDER_ITEM_1, GENDER_ITEM_2],
    orientations: [],
    pronouns: [],
    interests: { culture_art: [], activism_community: [], lifestyle: [], tech_science: [] },
  });
}

const baseProfile: MyProfile = {
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
  photos: [],
  statistics: { likes_received: 0, matches_count: 0, events_count: 0 },
};

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCatalogs();
  });

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

describe('EditProfileScreen — "¿A quién te gustaría conocer?"', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCatalogs();
  });

  it('permite seleccionar una identidad específica del catálogo', async () => {
    render(<EditProfileScreen profile={baseProfile} />);
    await screen.findByTestId('edit-interested-gender-g1');

    const chip = screen.getByTestId('edit-interested-gender-g1');
    expect(chip.props.accessibilityState.checked).toBe(false);

    fireEvent.press(chip);

    expect(chip.props.accessibilityState.checked).toBe(true);
  });

  it('al marcar "Todes / sin preferencia" deselecciona cualquier identidad específica ya marcada', async () => {
    render(<EditProfileScreen profile={baseProfile} />);
    await screen.findByTestId('edit-interested-gender-g1');

    fireEvent.press(screen.getByTestId('edit-interested-gender-g1'));
    expect(screen.getByTestId('edit-interested-gender-g1').props.accessibilityState.checked).toBe(true);

    fireEvent.press(screen.getByTestId('edit-interested-gender-__interested_all_genders__'));

    expect(screen.getByTestId('edit-interested-gender-g1').props.accessibilityState.checked).toBe(false);
    expect(
      screen.getByTestId('edit-interested-gender-__interested_all_genders__').props.accessibilityState
        .checked,
    ).toBe(true);
  });

  it('al marcar una identidad específica deselecciona "Todes / sin preferencia" si ya estaba marcado', async () => {
    const profile = { ...baseProfile, interested_in_all_genders: true, interested_genders: [] };
    render(<EditProfileScreen profile={profile} />);
    await screen.findByTestId('edit-interested-gender-g1');

    expect(
      screen.getByTestId('edit-interested-gender-__interested_all_genders__').props.accessibilityState
        .checked,
    ).toBe(true);

    fireEvent.press(screen.getByTestId('edit-interested-gender-g2'));

    expect(
      screen.getByTestId('edit-interested-gender-__interested_all_genders__').props.accessibilityState
        .checked,
    ).toBe(false);
    expect(screen.getByTestId('edit-interested-gender-g2').props.accessibilityState.checked).toBe(true);
  });

  it('prefija "Todes / sin preferencia" cuando el perfil ya lo tiene marcado desde el GET', async () => {
    const profile = { ...baseProfile, interested_in_all_genders: true, interested_genders: [] };
    render(<EditProfileScreen profile={profile} />);
    await screen.findByTestId('edit-interested-gender-g1');

    expect(
      screen.getByTestId('edit-interested-gender-__interested_all_genders__').props.accessibilityState
        .checked,
    ).toBe(true);
    expect(screen.getByTestId('edit-interested-gender-g1').props.accessibilityState.checked).toBe(false);
  });

  it('prefija las identidades específicas ya guardadas cuando el perfil no tiene "Todes" marcado', async () => {
    const profile = {
      ...baseProfile,
      interested_in_all_genders: false,
      interested_genders: [GENDER_ITEM_2],
    };
    render(<EditProfileScreen profile={profile} />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-interested-gender-g2').props.accessibilityState.checked).toBe(true);
    });

    expect(screen.getByTestId('edit-interested-gender-g1').props.accessibilityState.checked).toBe(false);
    expect(
      screen.getByTestId('edit-interested-gender-__interested_all_genders__').props.accessibilityState
        .checked,
    ).toBe(false);
  });
});
