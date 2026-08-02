import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { text } from '../../../lib/theme';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { UnreadBadge } from './UnreadBadge';

// Ícono de campana + badge de no leídos, reusado en cualquier pantalla que
// necesite acceso rápido a la bandeja de notificaciones (hoy: Explorar,
// Eventos, Chats, detalle de chat). Antes vivía inline solo en
// ExploreScreen — extraído 2026-08-02 al agregarse a más pantallas, para no
// triplicar el polling de useUnreadCount y la navegación.
export function NotificationBell() {
  const router = useRouter();
  const { count } = useUnreadCount();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(app)/notifications')}
      accessibilityLabel="Notificaciones"
      accessibilityRole="button"
      style={styles.button}
      testID="notification-bell"
    >
      <Ionicons name="notifications-outline" size={24} color={text.primary} />
      <UnreadBadge count={count} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
  },
});
