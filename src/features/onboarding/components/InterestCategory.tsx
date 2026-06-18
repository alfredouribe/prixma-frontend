import { View, Text, StyleSheet } from 'react-native';
import { text, typography, spacing } from '../../../lib/theme';
import { ChipSelector } from './ChipSelector';
import type { Interest, InterestCategory as Category } from '../types/onboarding.types';

const CATEGORY_LABELS: Record<Category, string> = {
  culture_art: 'Cultura y arte',
  activism_community: 'Activismo y comunidad',
  lifestyle: 'Vida y estilo',
  tech_science: 'Tech y ciencia',
};

interface InterestCategoryProps {
  category: Category;
  items: Interest[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function InterestCategory({ category, items, selected, onToggle }: InterestCategoryProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{CATEGORY_LABELS[category]}</Text>
      <ChipSelector items={items} selected={selected} onToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  title: {
    ...typography.label,
    color: text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
