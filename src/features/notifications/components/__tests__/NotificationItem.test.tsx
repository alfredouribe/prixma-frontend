import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NotificationItem } from '../NotificationItem';
import type { Notification } from '../../types/notification.types';

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'match',
    title: '¡Es un match! 🌟',
    body: 'Tú y Sam se gustaron mutuamente.',
    data: { conversation_id: 'conv-1' },
    read_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('NotificationItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el punto de no leído cuando read_at es null', () => {
    render(<NotificationItem notification={buildNotification({ read_at: null })} onRead={jest.fn()} />);

    expect(screen.getByTestId('unread-dot-notif-1')).toBeTruthy();
  });

  it('no muestra el punto de no leído cuando read_at tiene valor', () => {
    render(
      <NotificationItem
        notification={buildNotification({ read_at: '2026-07-26T09:00:00Z' })}
        onRead={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('unread-dot-notif-1')).toBeNull();
  });

  it('llama a onRead con el id al tocar la notificación', () => {
    const onRead = jest.fn();
    render(<NotificationItem notification={buildNotification()} onRead={onRead} />);

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(onRead).toHaveBeenCalledWith('notif-1');
  });

  it('navega a la conversación para el tipo match', () => {
    render(
      <NotificationItem
        notification={buildNotification({ type: 'match', data: { conversation_id: 'conv-1' } })}
        onRead={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-1' },
    });
  });

  it('navega a la conversación para el tipo message', () => {
    render(
      <NotificationItem
        notification={buildNotification({ type: 'message', data: { conversation_id: 'conv-2' } })}
        onRead={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-2' },
    });
  });

  it('navega a la conversación para el tipo request_accepted', () => {
    render(
      <NotificationItem
        notification={buildNotification({ type: 'request_accepted', data: { conversation_id: 'conv-3' } })}
        onRead={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/chat/[id]',
      params: { id: 'conv-3' },
    });
  });

  it('navega a Explorar para el tipo super_like, sin revelar quién lo dio', () => {
    render(
      <NotificationItem notification={buildNotification({ type: 'super_like', data: null })} onRead={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(router.push).toHaveBeenCalledWith('/(app)/(tabs)/explore');
  });

  it('no navega si falta conversation_id en data', () => {
    render(
      <NotificationItem notification={buildNotification({ type: 'match', data: null })} onRead={jest.fn()} />,
    );

    fireEvent.press(screen.getByTestId('notification-item-notif-1'));

    expect(router.push).not.toHaveBeenCalled();
  });
});
