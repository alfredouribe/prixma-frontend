import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { surfaces, text, typography, radius, spacing, colors } from '../../../lib/theme';
import { useLogout } from '../../auth/hooks/useLogout';

const MENU_ITEMS = [
  {
    key: 'privacy',
    label: 'Privacidad y visibilidad',
    description: 'Modo incógnito, bloqueo geo',
  },
  {
    key: 'verification',
    label: 'Verificación',
    description: 'Perfil verificado ✓',
  },
  {
    key: 'notifications',
    label: 'Notificaciones',
    description: 'Matches, mensajes, eventos',
  },
  {
    key: 'premium',
    label: 'Prixma+',
    description: 'Actualiza tu plan',
  },
] as const;

export function ProfileSettingsMenu() {
  const router = useRouter();
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Configuración</Text>
      <View style={styles.menu}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.row,
              index < MENU_ITEMS.length - 1 && styles.rowBorder,
            ]}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowDescription}>{item.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutRow}
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menu: {
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: surfaces.border,
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
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.rose,
    fontFamily: 'PoppinsRounded-Medium',
  },
});
