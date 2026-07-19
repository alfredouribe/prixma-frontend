import { render, screen, fireEvent } from '@testing-library/react-native';
import { BlockModal } from '../BlockModal';

describe('BlockModal', () => {
  it('muestra el nombre en el título de confirmación', () => {
    render(
      <BlockModal visible targetName="Roberto" onConfirm={jest.fn()} onClose={jest.fn()} />,
    );
    expect(screen.getByText('¿Bloquear a Roberto?')).toBeTruthy();
  });

  it('llama a onConfirm al presionar "Sí, bloquear"', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<BlockModal visible targetName="Roberto" onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.press(screen.getByTestId('block-confirm-btn'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('no llama a onConfirm al presionar "Cancelar", llama a onClose', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<BlockModal visible targetName="Roberto" onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.press(screen.getByTestId('block-cancel-btn'));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
