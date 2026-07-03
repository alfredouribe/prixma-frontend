import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { surfaces, text, typography, spacing, colors } from '../../../lib/theme';
import { useLogout } from '../../auth/hooks/useLogout';

const MENU_ITEMS = [
  {
    key: 'privacy',
    label: 'Privacidad y visibilidad',
    description: 'Modo incógnito, bloqueo geo',
    icon: '👁',
    iconBg: `${colors.purple}18`,
  },
  {
    key: 'verification',
    label: 'Verificación',
    description: 'Perfil verificado ✓',
    icon: '🔒',
    iconBg: `${colors.green}18`,
  },
  {
    key: 'notifications',
    label: 'Notificaciones',
    description: 'Matches, mensajes, eventos',
    icon: '🔔',
    iconBg: `${colors.rose}18`,
  },
  {
    key: 'premium',
    label: 'Prixma+',
    description: 'Actualiza tu plan',
    icon: '⭐',
    iconBg: `${colors.yellow}18`,
  },
] as const;

export function ProfileSettingsMenu() {
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.row, index < MENU_ITEMS.length - 1 && styles.rowBorder]}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <View style={[styles.iconSquare, { backgroundColor: item.iconBg }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowDescription}>{item.description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutRow}
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.7}
      >
        <View style={[styles.iconSquare, { backgroundColor: surfaces.elevated }]}>
          <Text style={styles.iconText}>🚪</Text>
        </View>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: surfaces.card,
  },
  iconSquare: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 16,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typography.body,
    color: text.primary,
  },
  rowDescription: {
    ...typography.small,
    color: text.tertiary,
  },
  chevron: {
    fontSize: 20,
    color: text.tertiary,
    fontFamily: 'PoppinsRounded-Regular',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: surfaces.card,
  },
  logoutText: {
    ...typography.body,
    color: colors.rose,
    fontFamily: 'PoppinsRounded-Medium',
    flex: 1,
  },
});
