import { render, fireEvent } from '@testing-library/react-native';
import { LikeLimitPaywall } from '../LikeLimitPaywall';

describe('LikeLimitPaywall', () => {
  it('muestra el paywall cuando visible es true', () => {
    const { getByTestId, getByText } = render(
      <LikeLimitPaywall visible={true} onClose={jest.fn()} />,
    );
    expect(getByTestId('like-limit-paywall')).toBeTruthy();
    expect(getByText('Actualiza tu plan')).toBeTruthy();
  });

  it('llama a onClose al tocar el botón de cerrar', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<LikeLimitPaywall visible={true} onClose={onClose} />);

    fireEvent.press(getByTestId('like-limit-paywall-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onUpgrade al tocar "Actualiza tu plan" si se provee', () => {
    const onUpgrade = jest.fn();
    const { getByText } = render(
      <LikeLimitPaywall visible={true} onClose={jest.fn()} onUpgrade={onUpgrade} />,
    );

    fireEvent.press(getByText('Actualiza tu plan'));

    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('sin onUpgrade, tocar "Actualiza tu plan" simplemente cierra el modal (no hay pantalla de compra todavía)', () => {
    const onClose = jest.fn();
    const { getByText } = render(<LikeLimitPaywall visible={true} onClose={onClose} />);

    fireEvent.press(getByText('Actualiza tu plan'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
