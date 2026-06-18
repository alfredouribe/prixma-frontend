import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

interface Props {
  label: string;
  placeholder?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxLength?: number;
  maxTags?: number;
}

export function TagInput({
  label,
  placeholder,
  tags,
  onTagsChange,
  maxLength = 50,
  maxTags = 10,
}: Props) {
  const [inputValue, setInputValue] = useState('');

  function addTag() {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onTagsChange([...tags, trimmed]);
    setInputValue('');
  }

  function removeTag(index: number) {
    onTagsChange(tags.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={text.tertiary}
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={addTag}
          blurOnSubmit={false}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={addTag}
          disabled={!inputValue.trim()}
          activeOpacity={0.7}
          style={[styles.addBtn, !inputValue.trim() && styles.addBtnDisabled]}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View style={styles.tagList}>
          {tags.map((tag, i) => (
            <TouchableOpacity
              key={`${tag}-${i}`}
              onPress={() => removeTag(i)}
              activeOpacity={0.7}
              style={styles.tag}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.tagRemove}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  label: { ...typography.label, color: text.secondary, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: text.primary,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: {
    ...typography.h2,
    color: colors.white,
    lineHeight: 28,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: surfaces.elevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  tagText: { ...typography.small, color: colors.purple },
  tagRemove: { ...typography.caption, color: text.tertiary },
});
