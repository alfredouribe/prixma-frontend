import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, surfaces, text, spacing, radius, typography } from '../../../lib/theme';

interface TermsCheckboxProps {
  label: string;
  linkText?: string;
  onLinkPress?: () => void;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  testID?: string;
}

export function TermsCheckbox({
  label,
  linkText,
  onLinkPress,
  value,
  onChange,
  error,
  testID,
}: TermsCheckboxProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onChange(!value)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
        testID={testID}
      >
        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
          {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </View>
        <Text style={styles.label}>
          {label}
          {linkText && onLinkPress && (
            <Text onPress={onLinkPress} style={styles.link}>
              {' '}
              {linkText}
            </Text>
          )}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  label: {
    ...typography.small,
    color: text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: colors.purple,
    textDecorationLine: 'underline',
  },
  error: {
    ...typography.small,
    color: colors.rose,
    marginTop: spacing.xs,
    marginLeft: 22 + spacing.md,
  },
});
