import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces } from '../../../lib/theme';
import type { Intention } from '../types/matching.types';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese).
const REWIND_LABEL = 'Deshacer';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface IntentionConfig {
  icon: IoniconName;
  color: string;
  shadowColor: string;
}

const INTENTION_CONFIG: Record<Intention, IntentionConfig> = {
  partner: { icon: 'heart', color: colors.rose, shadowColor: colors.rose },
  friendship: { icon: 'people', color: colors.yellow, shadowColor: colors.yellow },
  community: { icon: 'hand-left', color: colors.green, shadowColor: colors.green },
  mentorship: { icon: 'sparkles', color: colors.blue, shadowColor: colors.blue },
};

const FALLBACK_CONFIG: IntentionConfig = {
  icon: 'heart',
  color: colors.rose,
  shadowColor: colors.rose,
};

/**
 * Pure function: resolves the icon/color for the main "like" button based on
 * the authenticated user's declared intention — not the profile being viewed.
 * See spec.md → "Ícono del botón principal — dinámico según intención".
 */
export function getIntentionConfig(intention: Intention | null): IntentionConfig {
  if (!intention) return FALLBACK_CONFIG;
  return INTENTION_CONFIG[intention];
}

interface CardActionsProps {
  intention: Intention | null;
  onSkip: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  hasVideo?: boolean;
  disabled?: boolean;
  // Deshacer swipe (features/premium/specs/spec.md → "Deshacer swipe /
  // rewind"). Oculto (no deshabilitado-y-gris) cuando no aplica — mismo
  // criterio ya usado en este componente para `hasVideo`, en vez de mostrar
  // un botón inerte.
  canRewind?: boolean;
  onRewind?: () => void;
  isRewinding?: boolean;
}

export function CardActions({
  intention,
  onSkip,
  onLike,
  onSuperLike,
  hasVideo,
  disabled,
  canRewind,
  onRewind,
  isRewinding,
}: CardActionsProps) {
  const likeConfig = getIntentionConfig(intention);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, styles.skip]}
        onPress={onSkip}
        disabled={disabled}
        accessibilityLabel="Pasar"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color={colors.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.like,
          { backgroundColor: likeConfig.color, shadowColor: likeConfig.shadowColor },
        ]}
        onPress={onLike}
        disabled={disabled}
        accessibilityLabel="Like"
        accessibilityRole="button"
      >
        <Ionicons name={likeConfig.icon} size={28} color={colors.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.superLike]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityLabel="Super like"
        accessibilityRole="button"
      >
        <Ionicons name="star" size={22} color={colors.yellow} />
      </TouchableOpacity>

      {hasVideo && (
        <TouchableOpacity
          style={[styles.button, styles.video]}
          onPress={() => {}}
          disabled={disabled}
          accessibilityLabel="Video"
          accessibilityRole="button"
        >
          <Ionicons name="play" size={20} color={colors.purple} />
        </TouchableOpacity>
      )}

      {canRewind && (
        <TouchableOpacity
          style={[styles.button, styles.rewind]}
          onPress={onRewind}
          disabled={disabled || isRewinding}
          accessibilityLabel={REWIND_LABEL}
          accessibilityRole="button"
          testID="rewind-button"
        >
          <Ionicons name="arrow-undo" size={20} color={colors.orange} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  skip: {
    backgroundColor: surfaces.border,
    width: 64,
    height: 64,
    borderRadius: radius.full,
  },
  like: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
  },
  superLike: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: colors.yellow,
  },
  video: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: colors.purple,
  },
  rewind: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: colors.orange,
  },
});
