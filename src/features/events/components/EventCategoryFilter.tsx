import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { EventFilterKey } from '../hooks/useEvents';

interface FilterOption {
  key: EventFilterKey;
  label: string;
}

// Copy exacto: brand/copies.md → "Eventos" → Categorías.
const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Todos' },
  { key: 'this_week', label: 'Esta semana' },
  { key: 'pride', label: 'Pride' },
  { key: 'social', label: 'Social' },
  { key: 'art', label: 'Arte' },
  { key: 'activism', label: 'Activismo' },
];

interface EventCategoryFilterProps {
  value: EventFilterKey;
  onChange: (value: EventFilterKey) => void;
}

export function EventCategoryFilter({ value, onChange }: EventCategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_OPTIONS.map((option) => {
        const selected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            testID={`event-filter-${option.key}`}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: surfaces.muted,
    backgroundColor: surfaces.card,
  },
  chipSelected: {
    borderColor: colors.purple,
    backgroundColor: 'rgba(155, 93, 255, 0.18)',
  },
  chipText: {
    ...typography.small,
    color: text.secondary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  chipTextSelected: {
    color: colors.purple,
  },
});
