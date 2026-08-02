import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../lib/theme';

interface UnreadBadgeProps {
  count: number;
}

// spec.md → "Badge de no leídos": "Número de notificaciones no leídas
// (máximo '99+')". No se renderiza nada si no hay no leídas.
export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.badge} testID="unread-badge">
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    top: -4,
    right: -6,
  },
  text: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 12,
    color: colors.white,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
});
