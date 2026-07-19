import { render, screen, fireEvent } from '@testing-library/react-native';
import { MessageInput } from '../MessageInput';

describe('MessageInput', () => {
  it('deshabilita el botón de enviar cuando el campo está vacío', () => {
    render(<MessageInput onSend={jest.fn()} />);
    expect(screen.getByTestId('message-send-btn').props.accessibilityState.disabled).toBe(true);
  });

  it('deshabilita el botón de enviar cuando el mensaje supera 500 caracteres', () => {
    render(<MessageInput onSend={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('message-input'), 'a'.repeat(501));
    expect(screen.getByTestId('message-send-btn').props.accessibilityState.disabled).toBe(true);
  });

  it('habilita el botón de enviar con contenido válido y llama a onSend', () => {
    const onSend = jest.fn();
    render(<MessageInput onSend={onSend} />);

    fireEvent.changeText(screen.getByTestId('message-input'), 'Hola, ¿cómo estás?');
    expect(screen.getByTestId('message-send-btn').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('message-send-btn'));
    expect(onSend).toHaveBeenCalledWith('Hola, ¿cómo estás?');
  });

  it('deshabilita el botón mientras isSending es true', () => {
    render(<MessageInput onSend={jest.fn()} isSending />);
    fireEvent.changeText(screen.getByTestId('message-input'), 'Hola');
    expect(screen.getByTestId('message-send-btn').props.accessibilityState.disabled).toBe(true);
  });
});
