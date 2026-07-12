import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface VerificationStatusScreenProps {
  onRetry?: () => void;
  onGoToExplore?: () => void;
}

export function VerificationStatusScreen({ onRetry, onGoToExplore }: VerificationStatusScreenProps) {
  const router = useRouter();
  const { status, isLoading, error, reload } = useVerificationStatus();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !status) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}</Text>
        <TouchableOpacity style={styles.button} onPress={reload} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (status.status === 'approved') {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="checkmark-circle" size={64} color={colors.green} style={styles.icon} />
        <Text style={styles.title}>¡Ya estás verificade!</Text>
        <Text style={styles.subtitle}>
          Tu badge aparece en tu perfil para que la comunidad sepa que eres real.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Verificade</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onGoToExplore} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>Ir a explorar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (status.status === 'rejected') {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="close-circle" size={64} color={colors.rose} style={styles.icon} />
        <Text style={styles.title}>¡Oh oh! No pudimos verificarte</Text>
        {status.rejection_reason && <Text style={styles.subtitle}>{status.rejection_reason}</Text>}
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>¿Lo intentamos de nuevo?</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.centered}>
      <Ionicons name="hourglass-outline" size={64} color={colors.orange} style={styles.icon} />
      <Text style={styles.title}>¡Gracias! Estamos revisando tu documento</Text>
      <Text style={styles.subtitle}>Esto puede tardar hasta 24 horas. Te avisamos en cuanto esté listo.</Text>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push('/(app)/profile')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonSecondaryLabel}>Entendido</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  icon: { marginBottom: spacing.sm },
  title: { ...typography.h2, color: text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: text.secondary, textAlign: 'center' },
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  badge: {
    backgroundColor: `${colors.green}22`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  badgeText: { ...typography.label, color: colors.green, fontFamily: 'PoppinsRounded-SemiBold' },
  button: {
    marginTop: spacing.lg,
    height: 52,
    minWidth: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonLabel: { ...typography.button, color: colors.white },
  buttonSecondary: {
    marginTop: spacing.lg,
    height: 52,
    minWidth: 220,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonSecondaryLabel: { ...typography.button, color: colors.purple },
});
