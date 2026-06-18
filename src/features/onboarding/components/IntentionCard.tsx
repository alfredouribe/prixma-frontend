import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { Intention } from '../types/onboarding.types';

interface IntentionOption {
  value: Intention;
  label: string;
  description: string;
  icon: string;
}

const OPTIONS: IntentionOption[] = [
  { value: 'partner', label: 'Una pareja', description: 'Relación romántica o afectiva', icon: '💜' },
  { value: 'friendship', label: 'Amistades LGBTQ+', description: 'Personas con quien conectar', icon: '✨' },
  { value: 'community', label: 'Comunidad y activismo', description: 'Eventos, causas, espacios seguros', icon: '🌈' },
  { value: 'mentorship', label: 'Mentoría', description: 'Guía de alguien con más experiencia', icon: '🌱' },
];

interface IntentionCardProps {
  selected: Intention | null;
  onSelect: (value: Intention) => void;
}

export function IntentionCard({ selected, onSelect }: IntentionCardProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.card, active && styles.cardActive]}
          >
            <View style={styles.left}>
              <Text style={styles.icon}>{opt.icon}</Text>
              <View>
                <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
                <Text style={styles.description}>{opt.description}</Text>
              </View>
            </View>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    backgroundColor: surfaces.card,
  },
  cardActive: {
    borderColor: colors.purple,
    backgroundColor: surfaces.elevated,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...typography.body,
    fontFamily: 'PoppinsRounded-SemiBold',
    color: text.secondary,
  },
  labelActive: {
    color: text.primary,
  },
  description: {
    ...typography.small,
    color: text.tertiary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
});
