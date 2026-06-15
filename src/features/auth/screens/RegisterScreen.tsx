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
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';
import { colors, surfaces, text, spacing, typography } from '../../../lib/theme';
import type { RegisterFormData } from '../schemas/registerSchema';
import type { RegisterPayload } from '../types/auth.types';

export function RegisterScreen() {
  const router = useRouter();
  const { handleRegister, isLoading, error } = useRegister();

  function onSubmit(data: RegisterFormData) {
    const payload: RegisterPayload = {
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      date_of_birth: data.date_of_birth,
      terms_accepted: data.terms_accepted,
      privacy_accepted: data.privacy_accepted,
    };
    handleRegister(payload);
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

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad LGBTQ+ más segura de México.</Text>

          <RegisterForm onSubmit={onSubmit} isLoading={isLoading} error={error} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.small,
    color: text.secondary,
  },
  loginLink: {
    ...typography.small,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
});
