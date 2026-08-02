// Shape real de `NotificationResource` (backend/app/Http/Resources/NotificationResource.php)
// — ver features/notifications/specs/plan.md → "NotificationResource".

export type NotificationType = 'match' | 'message' | 'super_like' | 'request_accepted';

export interface NotificationData {
  conversation_id?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsPageMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface NotificationsPage {
  notifications: Notification[];
  meta: NotificationsPageMeta;
}

export type DevicePlatform = 'ios' | 'android';
