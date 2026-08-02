import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NotificationBell } from '../NotificationBell';
import { notificationService } from '../../services/notificationService';

jest.mock('../../services/notificationService');

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (notificationService.getUnreadCount as jest.Mock).mockResolvedValue(0);
  });

  it('navega a la bandeja de notificaciones al tocarlo', async () => {
    render(<NotificationBell />);

    fireEvent.press(screen.getByTestId('notification-bell'));

    expect(router.push).toHaveBeenCalledWith('/(app)/notifications');
  });

  it('no muestra el badge cuando no hay notificaciones sin leer', async () => {
    render(<NotificationBell />);

    await waitFor(() => expect(notificationService.getUnreadCount).toHaveBeenCalled());
    expect(screen.queryByTestId('unread-badge')).toBeNull();
  });

  it('muestra el badge con el conteo real de no leídas', async () => {
    (notificationService.getUnreadCount as jest.Mock).mockResolvedValue(5);
    render(<NotificationBell />);

    await waitFor(() => expect(screen.getByText('5')).toBeTruthy());
  });
});
