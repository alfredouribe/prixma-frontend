import { View, Text, TextInput, StyleSheet } from 'react-native';
import { surfaces, text, typography, radius, spacing } from '../../../lib/theme';

interface DescribeInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  maxLength?: number;
}

export function DescribeInput({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength = 100,
}: DescribeInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={text.tertiary}
        maxLength={maxLength}
        style={styles.input}
        multiline={false}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.label,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: text.primary,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
