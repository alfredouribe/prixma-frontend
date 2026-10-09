import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { IdentityScreen } from '../IdentityScreen';
import { onboardingService } from '../../services/onboardingService';

jest.mock('expo-router');
jest.mock('../../services/onboardingService');

const GENDER_ITEM_1 = { id: 'g1', slug: 'non_binary', label: 'No binarie' };
const GENDER_ITEM_2 = { id: 'g2', slug: 'trans_woman', label: 'Mujer trans' };
const ORIENTATION_ITEM = { id: 'o1', slug: 'lesbian', label: 'Lesbiana' };

function mockCatalogsAndStatus(profile: unknown = null) {
  (onboardingService.getCatalogs as jest.Mock).mockResolvedValue({
    gender_identities: [GENDER_ITEM_1, GENDER_ITEM_2],
    orientations: [ORIENTATION_ITEM],
    pronouns: [],
    interests: { culture_art: [], activism_community: [], lifestyle: [], tech_science: [] },
  });
  (onboardingService.getStatus as jest.Mock).mockResolvedValue({
    current_step: 0,
    completed: false,
    profile,
  });
}

describe('IdentityScreen — "¿A quién te gustaría conocer?"', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCatalogsAndStatus();
  });

  it('permite seleccionar una identidad específica del catálogo', async () => {
    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g1');

    const chip = screen.getByTestId('interested-gender-g1');
    expect(chip.props.accessibilityState.checked).toBe(false);

    fireEvent.press(chip);

    expect(chip.props.accessibilityState.checked).toBe(true);
  });

  it('al marcar "Todes / sin preferencia" deselecciona cualquier identidad específica ya marcada', async () => {
    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g1');

    fireEvent.press(screen.getByTestId('interested-gender-g1'));
    expect(screen.getByTestId('interested-gender-g1').props.accessibilityState.checked).toBe(true);

    fireEvent.press(screen.getByTestId('interested-gender-__interested_all_genders__'));

    expect(screen.getByTestId('interested-gender-g1').props.accessibilityState.checked).toBe(false);
    expect(
      screen.getByTestId('interested-gender-__interested_all_genders__').props.accessibilityState.checked,
    ).toBe(true);
  });

  it('al marcar una identidad específica deselecciona "Todes / sin preferencia" si ya estaba marcado', async () => {
    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g1');

    fireEvent.press(screen.getByTestId('interested-gender-__interested_all_genders__'));
    expect(
      screen.getByTestId('interested-gender-__interested_all_genders__').props.accessibilityState.checked,
    ).toBe(true);

    fireEvent.press(screen.getByTestId('interested-gender-g2'));

    expect(
      screen.getByTestId('interested-gender-__interested_all_genders__').props.accessibilityState.checked,
    ).toBe(false);
    expect(screen.getByTestId('interested-gender-g2').props.accessibilityState.checked).toBe(true);
  });

  it('no permite continuar si no se marca "Todes" ni ninguna identidad en "a quién te gustaría conocer"', async () => {
    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g1');

    const nameInput = screen.getByPlaceholderText('ej. Alex García');
    fireEvent.changeText(nameInput, 'Alex');
    // Identidad de género (selector de arriba, mismo catálogo repetido)
    fireEvent.press(screen.getAllByText('No binarie')[0]);
    // Orientación
    fireEvent.press(screen.getByText('Lesbiana'));
    // Deliberadamente no se toca "a quién te gustaría conocer"

    expect(screen.getByTestId('identity-submit-button').props.accessibilityState.disabled).toBe(true);
  });

  it('permite continuar cuando se marca "Todes" y el resto de los campos requeridos están completos', async () => {
    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g1');

    fireEvent.changeText(screen.getByPlaceholderText('ej. Alex García'), 'Alex');
    fireEvent.press(screen.getAllByText('No binarie')[0]);
    fireEvent.press(screen.getByText('Lesbiana'));
    fireEvent.press(screen.getByTestId('interested-gender-__interested_all_genders__'));

    await waitFor(() => {
      expect(screen.getByTestId('identity-submit-button').props.accessibilityState.disabled).toBe(false);
    });
  });

  it('prefija "a quién te gustaría conocer" desde el status del onboarding cuando ya existe', async () => {
    mockCatalogsAndStatus({
      display_name: 'Alex',
      gender_identities: [],
      orientations: [],
      custom_gender_identity: '',
      custom_orientation: '',
      interested_in_all_genders: false,
      interested_genders: [GENDER_ITEM_2],
    });

    render(<IdentityScreen />);
    await screen.findByTestId('interested-gender-g2');

    expect(screen.getByTestId('interested-gender-g2').props.accessibilityState.checked).toBe(true);
    expect(screen.getByTestId('interested-gender-g1').props.accessibilityState.checked).toBe(false);
    expect(
      screen.getByTestId('interested-gender-__interested_all_genders__').props.accessibilityState.checked,
    ).toBe(false);
  });
});
