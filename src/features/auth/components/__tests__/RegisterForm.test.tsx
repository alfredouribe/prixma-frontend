import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { RegisterForm } from '../RegisterForm';

jest.mock('../../../../lib/api');

const mockOnSubmit = jest.fn();

function dobString(yearsAgo: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d.toISOString().split('T')[0];
}

beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('RegisterForm', () => {
  it('shows age error when date of birth results in age under 18', async () => {
    await render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

    fireEvent.changeText(await screen.findByPlaceholderText('AAAA-MM-DD'), dobString(17));

    fireEvent.press(await screen.findByTestId('terms-checkbox'));
    fireEvent.press(await screen.findByTestId('privacy-checkbox'));

    fireEvent.press(await screen.findByTestId('submit-button'));

    await screen.findByText('⚠️ Debes tener al menos 18 años para usar Prixma.');
  });

  it('submit button is disabled until both terms are accepted', async () => {
    await render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

    expect((await screen.findByTestId('submit-button')).props.accessibilityState.disabled).toBe(true);

    fireEvent.press(await screen.findByTestId('terms-checkbox'));
    expect((await screen.findByTestId('submit-button')).props.accessibilityState.disabled).toBe(true);

    fireEvent.press(await screen.findByTestId('privacy-checkbox'));
    await waitFor(() => {
      expect(screen.getByTestId('submit-button').props.accessibilityState.disabled).toBe(false);
    });
  });

  it('calls onSubmit with correct payload on valid submission', async () => {
    await render(<RegisterForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

    const dob = dobString(20);
    fireEvent.changeText(await screen.findByPlaceholderText('tú@correo.com'), 'user@example.com');

    const passwordFields = await screen.findAllByPlaceholderText('••••••••');
    fireEvent.changeText(passwordFields[0], 'password123');
    fireEvent.changeText(passwordFields[1], 'password123');

    fireEvent.changeText(await screen.findByPlaceholderText('AAAA-MM-DD'), dob);

    fireEvent.press(await screen.findByTestId('terms-checkbox'));
    fireEvent.press(await screen.findByTestId('privacy-checkbox'));

    fireEvent.press(await screen.findByTestId('submit-button'));

    // React Hook Form passes (data, event) to onSubmit — match both
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
          date_of_birth: dob,
          terms_accepted: true,
          privacy_accepted: true,
        }),
        expect.anything(),
      );
    });
  });
});
