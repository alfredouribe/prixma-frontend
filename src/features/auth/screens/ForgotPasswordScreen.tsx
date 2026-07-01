import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { AuthGlow } from '../components/AuthGlow';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { colors, surfaces, text, spacing, typography } from '../../../lib/theme';
import type { ForgotPasswordFormData } from '../schemas/forgotPasswordSchema';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { handleForgotPassword, isLoading, sent } = useForgotPassword();

  function onSubmit(data: ForgotPasswordFormData) {
    handleForgotPassword(data.email);
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthGlow />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text.primary} />
        </TouchableOpacity>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-outline" size={40} color={colors.purple} />
          </View>
          <Text style={styles.successTitle}>¡Listo!</Text>
          <Text style={styles.successMessage}>
            Si existe una cuenta con ese correo, recibirás instrucciones en breve.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/reset-password')}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Tengo mi código</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthGlow />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviamos instrucciones para crear una nueva.
          </Text>

          <ForgotPasswordForm onSubmit={onSubmit} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
    paddingHorizontal: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    marginBottom: spacing.xxl,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.purple}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h2,
    color: text.primary,
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.white,
  },
  backToLogin: {
    padding: spacing.sm,
  },
  backToLoginText: {
    ...typography.small,
    color: text.secondary,
  },
});
