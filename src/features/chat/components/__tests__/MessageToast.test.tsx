import { fireEvent, render, screen } from '@testing-library/react-native';
import { MessageToast } from '../MessageToast';

describe('MessageToast', () => {
  it('no renderiza nada cuando toast es null', () => {
    const { toJSON } = render(<MessageToast toast={null} onPress={jest.fn()} onDismiss={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });

  it('muestra sender_name y preview cuando hay un toast', () => {
    render(
      <MessageToast
        toast={{ conversationId: 'conv-1', senderName: 'Sam', senderPhoto: null, preview: 'Hola, ¿cómo estás?' }}
        onPress={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('Sam')).toBeTruthy();
    expect(screen.getByText('Hola, ¿cómo estás?')).toBeTruthy();
  });

  it('llama a onPress al tocar el toast', () => {
    const onPress = jest.fn();
    render(
      <MessageToast
        toast={{ conversationId: 'conv-1', senderName: 'Sam', senderPhoto: null, preview: 'Hola' }}
        onPress={onPress}
        onDismiss={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('message-toast-press'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('llama a onDismiss (no a onPress) al tocar el botón de cerrar', () => {
    const onPress = jest.fn();
    const onDismiss = jest.fn();
    render(
      <MessageToast
        toast={{ conversationId: 'conv-1', senderName: 'Sam', senderPhoto: null, preview: 'Hola' }}
        onPress={onPress}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.press(screen.getByTestId('message-toast-dismiss'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('sigue mostrando el último contenido mientras se anima la salida (toast vuelve a null)', () => {
    const { rerender } = render(
      <MessageToast
        toast={{ conversationId: 'conv-1', senderName: 'Sam', senderPhoto: null, preview: 'Hola' }}
        onPress={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    rerender(<MessageToast toast={null} onPress={jest.fn()} onDismiss={jest.fn()} />);

    expect(screen.getByText('Sam')).toBeTruthy();
  });

  it('muestra la foto de perfil del emisor cuando el toast trae senderPhoto', () => {
    render(
      <MessageToast
        toast={{
          conversationId: 'conv-1',
          senderName: 'Sam',
          senderPhoto: 'https://cdn.example.com/sam.jpg',
          preview: 'Hola',
        }}
        onPress={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByTestId('message-toast-avatar').props.source).toEqual({
      uri: 'https://cdn.example.com/sam.jpg',
    });
  });

  it('no muestra imagen (cae al ícono genérico) cuando senderPhoto es null', () => {
    render(
      <MessageToast
        toast={{ conversationId: 'conv-1', senderName: 'Sam', senderPhoto: null, preview: 'Hola' }}
        onPress={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('message-toast-avatar')).toBeNull();
  });
});
