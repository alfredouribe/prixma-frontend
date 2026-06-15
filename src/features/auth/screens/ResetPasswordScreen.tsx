import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useResetPassword } from '../hooks/useResetPassword';
import { surfaces, text, spacing, typography } from '../../../lib/theme';
import type { ResetPasswordFormData } from '../schemas/resetPasswordSchema';

export function ResetPasswordScreen() {
  const router = useRouter();
  const { handleResetPassword, isLoading, error } = useResetPassword();

  function onSubmit(data: ResetPasswordFormData) {
    handleResetPassword(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa el código que recibiste y elige tu nueva contraseña.
          </Text>

          <ResetPasswordForm onSubmit={onSubmit} isLoading={isLoading} error={error} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
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
});
