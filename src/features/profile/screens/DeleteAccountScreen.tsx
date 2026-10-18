import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeleteAccount } from '../../auth/hooks/useDeleteAccount';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

// Copy aprobado — ver brand/copies.md → "Mi perfil" → "Eliminar cuenta".
const SCREEN_TITLE = 'Eliminar cuenta';
const INTRO_TEXT = 'Esta acción es permanente. Al eliminar tu cuenta:';
const BULLET_DATA = 'Tu perfil, fotos, video y documentos de verificación se borran de forma permanente.';
const BULLET_SESSION = 'Se cierra tu sesión en todos tus dispositivos de inmediato.';
const BULLET_KEPT =
  'Los mensajes que ya enviaste a otras personas se quedan del lado de elles — igual que cuando bloqueas a alguien.';
const DELETE_BUTTON = 'Eliminar mi cuenta';
const CANCEL_BUTTON = 'Cancelar';
const CONFIRM_TITLE = '¿Eliminar tu cuenta?';
const CONFIRM_MESSAGE = 'No podrás deshacer esto. Tu cuenta y tus datos se eliminarán de inmediato.';
const CONFIRM_BUTTON = 'Sí, eliminar';
const GENERIC_ERROR = 'Algo salió mal. Revisa tu conexión e intenta de nuevo.';
const BACK_LABEL = 'Volver';

/**
 * Pantalla de "Eliminar cuenta" (`Mi perfil → Configuración`). Screen solo
 * coordina — toda la lógica de borrado/limpieza de sesión vive en
 * useDeleteAccount.ts. No navega de forma imperativa tras el éxito: el
 * guard declarativo de app/(app)/_layout.tsx redirige solo en cuanto
 * useDeleteAccount limpia la sesión (ver ese hook para el detalle).
 */
export function DeleteAccountScreen() {
  const router = useRouter();
  const { handleDeleteAccount, isDeleting, error } = useDeleteAccount();

  async function performDelete() {
    const success = await handleDeleteAccount();
    if (!success) {
      Alert.alert('', error ?? GENERIC_ERROR);
    }
  }

  function confirmDelete() {
    Alert.alert(CONFIRM_TITLE, CONFIRM_MESSAGE, [
      { text: CANCEL_BUTTON, style: 'cancel' },
      { text: CONFIRM_BUTTON, style: 'destructive', onPress: performDelete },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel={BACK_LABEL}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={text.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {SCREEN_TITLE}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{INTRO_TEXT}</Text>

        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <Ionicons name="trash-outline" size={18} color={colors.rose} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{BULLET_DATA}</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="log-out-outline" size={18} color={colors.rose} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{BULLET_SESSION}</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={text.tertiary} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{BULLET_KEPT}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDelete}
          activeOpacity={0.85}
          disabled={isDeleting}
          accessibilityRole="button"
          testID="delete-account-button"
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.deleteButtonText}>{DELETE_BUTTON}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          disabled={isDeleting}
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>{CANCEL_BUTTON}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: text.primary,
    flex: 1,
    textAlign: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  intro: {
    ...typography.body,
    color: text.primary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  bulletList: {
    gap: spacing.md,
    backgroundColor: surfaces.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: surfaces.border,
    padding: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletIcon: { marginTop: 2 },
  bulletText: {
    ...typography.small,
    color: text.secondary,
    flex: 1,
  },
  deleteButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    backgroundColor: colors.rose,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.body,
    color: text.secondary,
  },
});
