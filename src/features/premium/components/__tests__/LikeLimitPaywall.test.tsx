import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LikeLimitPaywall } from '../LikeLimitPaywall';
import { usePurchasePrixmaPlus } from '../../../subscriptions/hooks/usePurchasePrixmaPlus';

jest.mock('../../../subscriptions/hooks/usePurchasePrixmaPlus');

const purchase = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (usePurchasePrixmaPlus as jest.Mock).mockReturnValue({ purchase, isPurchasing: false, error: null });
});

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

  it('al tocar "Actualiza tu plan", dispara la compra real', () => {
    const { getByText } = render(<LikeLimitPaywall visible={true} onClose={jest.fn()} />);

    fireEvent.press(getByText('Actualiza tu plan'));

    expect(purchase).toHaveBeenCalledTimes(1);
  });

  it('compra exitosa: llama a onUpgrade y a onClose', async () => {
    purchase.mockResolvedValue(true);
    const onClose = jest.fn();
    const onUpgrade = jest.fn();
    const { getByText } = render(
      <LikeLimitPaywall visible={true} onClose={onClose} onUpgrade={onUpgrade} />,
    );

    fireEvent.press(getByText('Actualiza tu plan'));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('sin onUpgrade, una compra exitosa solo cierra el modal', async () => {
    purchase.mockResolvedValue(true);
    const onClose = jest.fn();
    const { getByText } = render(<LikeLimitPaywall visible={true} onClose={onClose} />);

    fireEvent.press(getByText('Actualiza tu plan'));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('compra no completada (cancelación o error): no llama ni a onUpgrade ni a onClose', async () => {
    purchase.mockResolvedValue(false);
    const onClose = jest.fn();
    const onUpgrade = jest.fn();
    const { getByText } = render(
      <LikeLimitPaywall visible={true} onClose={onClose} onUpgrade={onUpgrade} />,
    );

    fireEvent.press(getByText('Actualiza tu plan'));

    await waitFor(() => expect(purchase).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
    expect(onUpgrade).not.toHaveBeenCalled();
  });

  it('muestra un indicador de carga y deshabilita el botón mientras isPurchasing es true', () => {
    (usePurchasePrixmaPlus as jest.Mock).mockReturnValue({ purchase, isPurchasing: true, error: null });

    const { queryByText } = render(<LikeLimitPaywall visible={true} onClose={jest.fn()} />);

    expect(queryByText('Actualiza tu plan')).toBeNull();
  });
});
