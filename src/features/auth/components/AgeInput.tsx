import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, surfaces, text, spacing, radius, typography } from '../../../lib/theme';

interface AgeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

function computeAge(dateString: string): number {
  const today = new Date();
  const birth = new Date(dateString);
  if (isNaN(birth.getTime())) return -1;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function AgeInput({ value, onChange, onBlur, error }: AgeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const age = value ? computeAge(value) : -1;
  const showAgeWarning = age >= 0 && age < 18 && !error;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Fecha de nacimiento</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !!error && styles.inputContainerError,
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={text.tertiary} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={text.tertiary}
          keyboardType="numbers-and-punctuation"
          style={styles.input}
          maxLength={10}
        />
      </View>
      {showAgeWarning && (
        <Text style={styles.warning}>⚠️ Debes tener al menos 18 años para usar Prixma.</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surfaces.card,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  inputContainerFocused: {
    borderColor: colors.purple,
  },
  inputContainerError: {
    borderColor: colors.rose,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: text.primary,
    paddingVertical: 0,
  },
  warning: {
    ...typography.small,
    color: colors.orange,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.small,
    color: colors.rose,
    marginTop: spacing.xs,
  },
});
