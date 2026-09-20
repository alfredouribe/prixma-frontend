import { useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { usePurchasePrixmaPlus } from '../../subscriptions/hooks/usePurchasePrixmaPlus';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese). El botón "Actualiza tu plan" sí es copy ya
// aprobado (brand/copies.md → "Mi perfil" → Opciones de configuración →
// Premium).
const TITLE = 'Se acabaron tus likes de hoy';
const SUBTITLE = 'Con Prixma+ tienes likes ilimitados, sin esperar a mañana.';
const DISMISS = 'Ahora no';

interface LikeLimitPaywallProps {
  visible: boolean;
  onClose: () => void;
  // Opcional — se llama además de (no en vez de) la compra real, solo si el
  // llamador necesita reaccionar a un upgrade exitoso más allá de cerrar el
  // modal (ver ExploreScreen.tsx, que hoy no lo usa). El propio componente
  // ya dispara la compra real vía usePurchasePrixmaPlus.
  onUpgrade?: () => void;
}

/**
 * Se muestra cuando el backend rechaza un like/super_like con 429 por haber
 * alcanzado `free_likes_per_day` (ver `useSwipe.ts` → `isLikeLimitError`).
 * "Actualiza tu plan" dispara la compra real de Prixma+ (RevenueCat/Google
 * Play Billing) vía `usePurchasePrixmaPlus` — ver
 * features/subscriptions/specs/plan.md → "Compra real desde los paywalls
 * existentes". Una compra exitosa cierra el modal (y llama a `onUpgrade` si
 * se proveyó); una cancelación del usuario no muestra nada; un error real
 * muestra un Alert con el mensaje del hook.
 */
export function LikeLimitPaywall({ visible, onClose, onUpgrade }: LikeLimitPaywallProps) {
  const { purchase, isPurchasing, error } = usePurchasePrixmaPlus();

  useEffect(() => {
    if (error) {
      Alert.alert('', error);
    }
  }, [error]);

  async function handleUpgrade() {
    const success = await purchase();
    if (success) {
      onUpgrade?.();
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card} testID="like-limit-paywall">
          <Text style={styles.brand}>Prixma+</Text>
          <Text style={styles.title}>{TITLE}</Text>
          <Text style={styles.subtitle}>{SUBTITLE}</Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={handleUpgrade}
            activeOpacity={0.85}
            accessibilityRole="button"
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.upgradeBtnText}>Actualiza tu plan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            testID="like-limit-paywall-close"
          >
            <Text style={styles.closeBtnText}>{DISMISS}</Text>
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
