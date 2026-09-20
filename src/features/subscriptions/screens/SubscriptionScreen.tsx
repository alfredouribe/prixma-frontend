import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { usePremiumSettings } from '../../premium/hooks/usePremiumSettings';
import { usePurchasePrixmaPlus } from '../hooks/usePurchasePrixmaPlus';
import { useRestorePurchases } from '../hooks/useRestorePurchases';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';

// [COPY PENDIENTE] — sin texto aprobado en brand/copies.md para esta
// pantalla ni para sus estados (ver features/subscriptions/specs/tasks.md →
// "Copy — regla dura del proyecto"). "Prixma+" y "Actualiza tu plan" SÍ son
// copy ya aprobado (brand/copies.md línea 360) y se reusan tal cual, sin
// marcar.
const SCREEN_TITLE = '[COPY PENDIENTE] Mi suscripción';
const BACK_LABEL = 'Volver';
const NEVER_SUBSCRIBED_TITLE = '[COPY PENDIENTE] Todavía no tienes Prixma+';
const NEVER_SUBSCRIBED_SUBTITLE =
  '[COPY PENDIENTE] Likes ilimitados, sin publicidad, y acceso a las funciones premium de Prixma.';
const ACTIVE_RENEWING_TITLE = '[COPY PENDIENTE] Prixma+ activo';
const ACTIVE_RENEWING_SUBTITLE = '[COPY PENDIENTE] Se renueva el';
const ACTIVE_CANCELLED_TITLE = '[COPY PENDIENTE] Cancelaste tu renovación';
const ACTIVE_CANCELLED_SUBTITLE = '[COPY PENDIENTE] Tienes acceso hasta el';
const EXPIRED_TITLE = '[COPY PENDIENTE] Tu Prixma+ venció';
const EXPIRED_SUBTITLE = '[COPY PENDIENTE] Vuelve a suscribirte para recuperar tus beneficios.';
const MANUAL_PREMIUM_NOTE = '[COPY PENDIENTE] Tienes Prixma+ activo por otro medio (otorgado por soporte).';
const MANAGE_BUTTON = '[COPY PENDIENTE] Gestionar suscripción';
const RESTORE_BUTTON = '[COPY PENDIENTE] Restaurar compras';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * "Mi suscripción" — sección nueva en Perfil (ver
 * features/subscriptions/specs/tasks.md → punto 3). Cuatro estados
 * derivados de `useSubscriptionStatus` (fuente de verdad: RevenueCat, no
 * `/api/premium/settings` — ver ese hook para el porqué): nunca se
 * suscribió / vencida (ambos muestran el flujo de compra), activa con
 * auto-renovación, y cancelada-pero-con-acceso-hasta-que-expire. Screen
 * solo coordina — toda la lógica vive en los hooks
 * (`usePurchasePrixmaPlus`, `useRestorePurchases`, `useSubscriptionStatus`,
 * `usePremiumSettings`).
 */
export function SubscriptionScreen() {
  const router = useRouter();
  const { settings } = usePremiumSettings();
  const {
    status,
    expirationDate,
    managementUrl,
    isLoading: isStatusLoading,
    refresh: refreshStatus,
  } = useSubscriptionStatus();
  const { purchase, isPurchasing, error: purchaseError } = usePurchasePrixmaPlus();
  const { restore, isRestoring, error: restoreError } = useRestorePurchases();

  // Mismo patrón ya usado en ExploreScreen.tsx/WhoLikedMeScreen.tsx para
  // errores de una sola acción — Alert con el mensaje del hook, vía efecto.
  useEffect(() => {
    if (purchaseError) Alert.alert('', purchaseError);
  }, [purchaseError]);

  useEffect(() => {
    if (restoreError) Alert.alert('', restoreError);
  }, [restoreError]);

  async function handlePurchase() {
    const success = await purchase();
    if (success) refreshStatus();
  }

  async function handleRestore() {
    const success = await restore();
    if (success) refreshStatus();
  }

  function handleManage() {
    if (managementUrl) {
      // Nunca WebView — mismo criterio que EventDetailScreen.tsx para
      // links externos.
      Linking.openURL(managementUrl);
    }
  }

  const showPurchaseFlow = status === 'never_subscribed' || status === 'expired';

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

      {isStatusLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card} testID="subscription-status-card">
            <Text style={styles.brand}>Prixma+</Text>

            {status === 'active_renewing' && (
              <>
                <Text style={styles.cardTitle}>{ACTIVE_RENEWING_TITLE}</Text>
                <Text style={styles.cardSubtitle}>
                  {ACTIVE_RENEWING_SUBTITLE} {formatDate(expirationDate)}
                </Text>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handleManage}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  testID="subscription-manage-button"
                >
                  <Text style={styles.secondaryBtnText}>{MANAGE_BUTTON}</Text>
                </TouchableOpacity>
              </>
            )}

            {status === 'active_cancelled' && (
              <>
                <Text style={styles.cardTitle}>{ACTIVE_CANCELLED_TITLE}</Text>
                <Text style={styles.cardSubtitle}>
                  {ACTIVE_CANCELLED_SUBTITLE} {formatDate(expirationDate)}
                </Text>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handleManage}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  testID="subscription-manage-button"
                >
                  <Text style={styles.secondaryBtnText}>{MANAGE_BUTTON}</Text>
                </TouchableOpacity>
              </>
            )}

            {showPurchaseFlow && (
              <>
                <Text style={styles.cardTitle}>{status === 'expired' ? EXPIRED_TITLE : NEVER_SUBSCRIBED_TITLE}</Text>
                <Text style={styles.cardSubtitle}>
                  {status === 'expired' ? EXPIRED_SUBTITLE : NEVER_SUBSCRIBED_SUBTITLE}
                </Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handlePurchase}
                  activeOpacity={0.85}
                  disabled={isPurchasing}
                  accessibilityRole="button"
                  testID="subscription-purchase-button"
                >
                  {isPurchasing ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>Actualiza tu plan</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Estado del toggle manual / paquetes (ej. Premium temporal
              otorgado desde Filament) — solo tiene sentido mostrarlo cuando
              no hay ya una suscripción real de RevenueCat que lo cubra. */}
          {showPurchaseFlow && settings?.is_premium && (
            <Text style={styles.manualPremiumNote} testID="subscription-manual-premium-note">
              {MANUAL_PREMIUM_NOTE}
            </Text>
          )}

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            activeOpacity={0.7}
            disabled={isRestoring}
            accessibilityRole="button"
            testID="subscription-restore-button"
          >
            {isRestoring ? (
              <ActivityIndicator color={colors.purple} />
            ) : (
              <Text style={styles.restoreBtnText}>{RESTORE_BUTTON}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  card: {
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
  cardTitle: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: surfaces.elevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: surfaces.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.button,
    color: text.primary,
  },
  manualPremiumNote: {
    ...typography.small,
    color: text.tertiary,
    textAlign: 'center',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  restoreBtnText: {
    ...typography.body,
    color: colors.blue,
  },
});
