import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, text, typography } from '../../../lib/theme';

// Copy borrador, ver brand/copies.md → "⚠️ Borradores pendientes de
// revisión (Mafer)" → "Beneficios de Prixma+ (lista en los paywalls)".
// Lista verificada contra el código real (`User::hasPremiumAccess()`/
// `canSeeLikers()`) — nunca incluye rewind/boost/super likes extra, que
// son créditos de paquetes sueltos, no parte de la suscripción.
const BENEFITS: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { icon: 'infinite-outline', label: 'Likes y super likes ilimitados, sin esperar a mañana' },
  { icon: 'ban-outline', label: 'Sin anuncios en Explorar ni en el chat' },
  { icon: 'eye-outline', label: 'Descubre quién te dio like' },
];

/**
 * Lista corta de lo que Prixma+ desbloquea, reutilizada en los 3 paywalls
 * (`LikeLimitPaywall.tsx`, `WhoLikedMeScreen.tsx`, `SubscriptionScreen.tsx`)
 * — antes ninguno mostraba más que un subtítulo genérico, pedido real del
 * humano (2026-10-08).
 */
export function PrixmaPlusBenefitsList() {
  return (
    <View style={styles.container} testID="prixma-plus-benefits">
      {BENEFITS.map((benefit) => (
        <View key={benefit.icon} style={styles.row}>
          <Ionicons name={benefit.icon} size={18} color={colors.purple} />
          <Text style={styles.label}>{benefit.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.small,
    color: text.primary,
    flex: 1,
  },
});
