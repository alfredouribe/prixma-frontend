import { useRef, useState } from 'react';
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
  const inputRef = useRef<TextInput>(null);

  function commitTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onTagsChange([...tags, trimmed]);
  }

  function handleChangeText(v: string) {
    if (v.endsWith(',') || v.endsWith(' ')) {
      commitTag(v.slice(0, -1));
      setInputValue('');
      return;
    }
    setInputValue(v);
  }

  function handleSubmit() {
    commitTag(inputValue);
    setInputValue('');
  }

  function handleKeyPress({ nativeEvent }: { nativeEvent: { key: string } }) {
    if (nativeEvent.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onTagsChange(tags.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.field}
        onPress={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <TouchableOpacity
            key={`${tag}-${i}`}
            onPress={() => removeTag(i)}
            activeOpacity={0.7}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{tag}</Text>
            <Text style={styles.chipRemove}>✕</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          ref={inputRef}
          value={inputValue}
          onChangeText={handleChangeText}
          placeholder={tags.length === 0 ? placeholder : undefined}
          placeholderTextColor={text.tertiary}
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          submitBehavior="submit"
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  label: { ...typography.label, color: text.secondary, marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.small,
    fontFamily: 'PoppinsRounded-Medium',
    color: colors.white,
  },
  chipRemove: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  input: {
    ...typography.body,
    color: text.primary,
    minWidth: 80,
    flexGrow: 1,
    paddingVertical: spacing.xs,
  },
});
