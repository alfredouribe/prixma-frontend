import { render, screen, fireEvent } from '@testing-library/react-native';
import { RequestCard } from '../RequestCard';
import type { Conversation } from '../../types/chat.types';

function buildRequest(): Conversation {
  return {
    id: 'req-1',
    type: 'request',
    status: 'pending',
    other_user: { id: 'user-3', display_name: 'Nadia', photo: null, pronouns: ['ella'] },
    last_message: { content: 'Hola, ¿qué tal?', sender_id: 'user-3', created_at: '2026-07-19T09:00:00Z' },
    unread_count: 1,
    created_at: '2026-07-19T09:00:00Z',
    updated_at: '2026-07-19T09:00:00Z',
  };
}

describe('RequestCard', () => {
  it('llama a onAccept con la conversación al presionar "Aceptar"', () => {
    const onAccept = jest.fn();
    const conversation = buildRequest();
    render(
      <RequestCard conversation={conversation} isProcessing={false} onAccept={onAccept} onReject={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId(`accept-request-${conversation.id}`));

    expect(onAccept).toHaveBeenCalledWith(conversation);
  });

  it('llama a onReject con la conversación al presionar "Rechazar"', () => {
    const onReject = jest.fn();
    const conversation = buildRequest();
    render(
      <RequestCard conversation={conversation} isProcessing={false} onAccept={jest.fn()} onReject={onReject} />,
    );

    fireEvent.press(screen.getByTestId(`reject-request-${conversation.id}`));

    expect(onReject).toHaveBeenCalledWith(conversation);
  });

  it('muestra el nombre y el mensaje de la solicitud', () => {
    const conversation = buildRequest();
    render(
      <RequestCard conversation={conversation} isProcessing={false} onAccept={jest.fn()} onReject={jest.fn()} />,
    );

    expect(screen.getByText('Nadia')).toBeTruthy();
    expect(screen.getByText('Hola, ¿qué tal?')).toBeTruthy();
  });
});
