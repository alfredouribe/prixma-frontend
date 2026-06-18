import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

interface SafetyToggleProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

export function SafetyToggle({ icon, label, description, value, onToggle }: SafetyToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: surfaces.elevated, true: colors.purple }}
        thumbColor={colors.white}
        ios_backgroundColor={surfaces.elevated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surfaces.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontFamily: 'PoppinsRounded-Medium',
    color: text.primary,
  },
  description: {
    ...typography.small,
    color: text.secondary,
    marginTop: 2,
  },
});
