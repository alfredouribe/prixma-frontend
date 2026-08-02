import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, text, typography } from '../../../lib/theme';
// Reutiliza el formateador de tiempo relativo de Chat (mismo criterio ya
// usado por cross-feature imports en este proyecto, ver
// `ExploreScreen.tsx` → `useMyProfile` de Profile) — no hay librería de
// fechas instalada y el spec pide el mismo tipo de formato compacto
// ("hace 5 minutos" ≈ "5m").
import { formatRelativeTime } from '../../chat/utils/formatChatTime';
import { notificationRoute } from '../utils/notificationRoute';
import type { Notification, NotificationType } from '../types/notification.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TypeConfig {
  icon: IoniconName;
  color: string;
}

// Sin ícono aprobado en brand/ para tipos de notificación — elegidos por
// consistencia con el resto de la app: `heart`/rose ya es "match" en
// `CardActions.tsx`, `star`/yellow ya es "super like" ahí mismo,
// `checkmark-circle`/green sigue la semántica de colors.green ("éxito,
// verificado" en design-system.md), `chatbubble`/blue sigue la semántica
// de colors.blue ("mensajes, links, info").
const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  match: { icon: 'heart', color: colors.rose },
  message: { icon: 'chatbubble', color: colors.blue },
  super_like: { icon: 'star', color: colors.yellow },
  request_accepted: { icon: 'checkmark-circle', color: colors.green },
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const isUnread = notification.read_at === null;
  const config = TYPE_CONFIG[notification.type];

  function handlePress() {
    onRead(notification.id);
    const route = notificationRoute(notification);
    if (route) {
      router.push(route);
    }
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`notification-item-${notification.id}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${config.color}26` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.text} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.time}>{formatRelativeTime(notification.created_at)}</Text>
        {isUnread && <View style={styles.dot} testID={`unread-dot-${notification.id}`} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.h3,
    fontSize: 15,
    color: text.secondary,
  },
  titleUnread: {
    color: text.primary,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  text: {
    ...typography.small,
    color: text.secondary,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: text.tertiary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
  },
});
