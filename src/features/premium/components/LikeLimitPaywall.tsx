import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

// COPY PENDIENTE: brand/copies.md no define copy del paywall de likes
// todavía — mismo criterio de placeholder ya usado en EventsScreen.tsx /
// RequestModal.tsx (ver esos archivos). El botón "Actualiza tu plan" sí es
// copy ya aprobado (brand/copies.md → "Mi perfil" → Opciones de
// configuración → Premium).
const TITLE_PLACEHOLDER = '[COPY PENDIENTE: título del paywall de likes]';
const SUBTITLE_PLACEHOLDER = '[COPY PENDIENTE: subtítulo del paywall de likes]';
const DISMISS_PLACEHOLDER = '[COPY PENDIENTE: texto del botón "ahora no"]';

interface LikeLimitPaywallProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

/**
 * Se muestra cuando el backend rechaza un like/super_like con 429 por haber
 * alcanzado `free_likes_per_day` (ver `useSwipe.ts` → `isLikeLimitError`).
 * `onUpgrade` no lleva a ningún lado real todavía — no existe pantalla de
 * compra (ver features/premium/specs/spec.md → "Fuera de alcance"). Si no
 * se provee, el botón simplemente cierra el modal.
 */
export function LikeLimitPaywall({ visible, onClose, onUpgrade }: LikeLimitPaywallProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card} testID="like-limit-paywall">
          <Text style={styles.brand}>Prixma+</Text>
          <Text style={styles.title}>{TITLE_PLACEHOLDER}</Text>
          <Text style={styles.subtitle}>{SUBTITLE_PLACEHOLDER}</Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={onUpgrade ?? onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.upgradeBtnText}>Actualiza tu plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            testID="like-limit-paywall-close"
          >
            <Text style={styles.closeBtnText}>{DISMISS_PLACEHOLDER}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,13,20,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.purple,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  brand: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 24,
    color: colors.purple,
    letterSpacing: 1,
  },
  title: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  upgradeBtn: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  upgradeBtnText: {
    ...typography.button,
    color: colors.white,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
  },
  closeBtnText: {
    ...typography.small,
    color: text.secondary,
  },
});
