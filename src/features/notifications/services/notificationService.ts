import api from '../../../lib/api';
import type { DevicePlatform, Notification, NotificationsPage } from '../types/notification.types';

interface LaravelPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  async getNotifications(page = 1): Promise<NotificationsPage> {
    const { data } = await api.get<{ data: Notification[]; meta: LaravelPaginationMeta }>('/notifications', {
      params: { page },
    });
    return {
      notifications: data.data,
      meta: {
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        perPage: data.meta.per_page,
        total: data.meta.total,
      },
    };
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await api.patch<{ data: Notification }>(`/notifications/${id}/read`);
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return data.count;
  },

  async registerDeviceToken(token: string, platform: DevicePlatform): Promise<void> {
    await api.post('/notifications/device-token', { token, platform });
  },

  async removeDeviceToken(): Promise<void> {
    await api.delete('/notifications/device-token');
  },
};
