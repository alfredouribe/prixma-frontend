import { View, Text, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, spacing, radius } from '../../../lib/theme';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese).
const ACTIVE_LABEL = 'Prixma+ activo';
const ACTIVE_UNTIL_PREFIX = 'Prixma+ activo hasta';
const INACTIVE_LABEL = 'Prixma+ no activo';
const REWIND_LABEL = 'rewind disponibles';
const SUPER_LIKES_LABEL = 'super likes extra';

interface PremiumPerksCardProps {
  isPremium: boolean;
  premiumUntil: string | null;
  rewindCredits: number;
  extraSuperLikes: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Reemplaza al antiguo SuperLikesExtraBadge (oculto en 0) — a diferencia de
 * ese, esta sección siempre se muestra, incluso en 0, para que el usuario
 * sepa su estado real sin adivinar (pedido explícito del humano). Junta
 * estado de Premium (manual/paquete temporal/suscripción — las 3 fuentes
 * de `hasPremiumAccess()`, ver features/premium/specs/plan.md) + los dos
 * saldos consumibles (rewind, super likes extra) en un solo lugar dentro de
 * Mi Perfil.
 */
export function PremiumPerksCard({
  isPremium,
  premiumUntil,
  rewindCredits,
  extraSuperLikes,
}: PremiumPerksCardProps) {
  const showsExpiry = isPremium && premiumUntil !== null && new Date(premiumUntil) > new Date();

  const statusText = !isPremium
    ? INACTIVE_LABEL
    : showsExpiry
      ? `${ACTIVE_UNTIL_PREFIX} ${formatDate(premiumUntil as string)}`
      : ACTIVE_LABEL;

  return (
    <View style={styles.container} testID="premium-perks-card">
      <Text style={[styles.status, isPremium ? styles.statusActive : styles.statusInactive]}>
        {statusText}
      </Text>

      <View style={styles.row}>
        <PerkItem value={rewindCredits} label={REWIND_LABEL} testID="perk-rewind" />
        <View style={styles.divider} />
        <PerkItem value={extraSuperLikes} label={SUPER_LIKES_LABEL} testID="perk-super-likes" />
      </View>
    </View>
  );
}

function PerkItem({ value, label, testID }: { value: number; label: string; testID: string }) {
  return (
    <View style={styles.item} testID={testID}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: surfaces.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.purple,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  status: {
    ...typography.label,
    textAlign: 'center',
  },
  statusActive: {
    color: colors.purple,
  },
  statusInactive: {
    color: text.tertiary,
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 0.5,
    backgroundColor: surfaces.border,
  },
  value: {
    ...typography.h3,
    fontFamily: 'PoppinsRounded-Bold',
    color: colors.purple,
  },
  label: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'center',
  },
});
