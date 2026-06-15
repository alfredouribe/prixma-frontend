import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, surfaces, text, spacing, radius, typography } from '../../../lib/theme';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  inputTestID?: string;
}

export function AuthInput({
  label,
  icon,
  error,
  hint,
  isPassword = false,
  ...inputProps
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !!error && styles.inputContainerError,
        ]}
      >
        <Ionicons name={icon} size={18} color={text.tertiary} style={styles.leftIcon} />
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor={text.tertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
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
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: text.primary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  hint: {
    ...typography.small,
    color: text.tertiary,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.small,
    color: colors.rose,
    marginTop: spacing.xs,
  },
});
