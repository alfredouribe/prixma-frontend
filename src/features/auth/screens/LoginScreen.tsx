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
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { colors, surfaces, text, spacing, typography } from '../../../lib/theme';
import type { LoginFormData } from '../schemas/loginSchema';
import type { LoginPayload } from '../types/auth.types';

export function LoginScreen() {
  const router = useRouter();
  const { handleLogin, isLoading, error } = useLogin();

  function onSubmit(data: LoginFormData) {
    const payload: LoginPayload = {
      email: data.email,
      password: data.password,
    };
    handleLogin(payload);
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

          <Text style={styles.title}>Bienvenide de vuelta</Text>
          <Text style={styles.subtitle}>Inicia sesión para seguir conectande</Text>

          <LoginForm onSubmit={onSubmit} isLoading={isLoading} error={error} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿Aún no tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerLink}>Crear mi perfil</Text>
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    ...typography.small,
    color: text.secondary,
  },
  registerLink: {
    ...typography.small,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
});
