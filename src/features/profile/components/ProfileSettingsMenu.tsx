import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { surfaces, text, typography, spacing, colors } from '../../../lib/theme';
import { useLogout } from '../../auth/hooks/useLogout';
import type { ProfileVerificationStatus } from '../types/profile.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const MENU_ITEMS = [
  {
    key: 'privacy',
    label: 'Privacidad y visibilidad',
    description: 'Modo incógnito, bloqueo geo',
    icon: 'eye-outline' as IoniconName,
    iconColor: colors.purple,
    iconBg: `${colors.purple}18`,
  },
  {
    key: 'verification',
    label: 'Verificación',
    description: 'Perfil verificado ✓',
    icon: 'lock-closed-outline' as IoniconName,
    iconColor: colors.green,
    iconBg: `${colors.green}18`,
  },
  {
    key: 'notifications',
    label: 'Notificaciones',
    description: 'Matches, mensajes, eventos',
    icon: 'notifications-outline' as IoniconName,
    iconColor: colors.rose,
    iconBg: `${colors.rose}18`,
  },
  {
    key: 'premium',
    label: 'Prixma+',
    description: 'Actualiza tu plan',
    icon: 'sparkles-outline' as IoniconName,
    iconColor: colors.yellow,
    iconBg: `${colors.yellow}18`,
  },
] as const;

const MENU_ROUTES: Partial<Record<(typeof MENU_ITEMS)[number]['key'], string>> = {
  privacy: '/profile/privacy',
  verification: '/profile/verification',
  notifications: '/profile/notifications',
};

interface ProfileSettingsMenuProps {
  verificationStatus: ProfileVerificationStatus;
}

export function ProfileSettingsMenu({ verificationStatus }: ProfileSettingsMenuProps) {
  const router = useRouter();
  const { handleLogout, isLoading: isLoggingOut } = useLogout();

  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item, index) => {
        // "Perfil verificado ✓" solo es cierto cuando ya está verified — no hay
        // copy aprobado en brand/copies.md para unverified/pending/rejected,
        // así que se oculta en vez de inventar texto (ver spec.md → Copy pendiente).
        const description =
          item.key === 'verification' && verificationStatus !== 'verified' ? null : item.description;

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, index < MENU_ITEMS.length - 1 && styles.rowBorder]}
            activeOpacity={0.7}
            disabled={!MENU_ROUTES[item.key]}
            onPress={() => {
              const route = MENU_ROUTES[item.key];
              if (route) router.push(route as never);
            }}
          >
            <View style={[styles.iconSquare, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={18} color={item.iconColor} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              {description && <Text style={styles.rowDescription}>{description}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.logoutRow}
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.7}
      >
        <View style={[styles.iconSquare, { backgroundColor: surfaces.elevated }]}>
          <Ionicons name="log-out-outline" size={18} color={colors.rose} />
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
