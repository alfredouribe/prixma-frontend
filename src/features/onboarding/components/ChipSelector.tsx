import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { CatalogItem } from '../types/onboarding.types';

interface ChipSelectorProps {
  items: CatalogItem[];
  selected: string[];
  onToggle: (id: string) => void;
  color?: string;
}

export function ChipSelector({
  items,
  selected,
  onToggle,
  color = colors.purple,
}: ChipSelectorProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = selected.includes(item.id);
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            style={[
              styles.chip,
              active
                ? { backgroundColor: color, borderColor: color }
                : { backgroundColor: surfaces.card, borderColor: surfaces.border },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.white : text.secondary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  label: {
    ...typography.small,
    fontFamily: 'PoppinsRounded-Medium',
  },
});
