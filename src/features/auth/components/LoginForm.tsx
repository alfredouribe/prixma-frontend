import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { colors, text, spacing, typography } from '../../../lib/theme';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <AuthInput
            label="Correo electrónico"
            icon="mail-outline"
            placeholder="tú@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <AuthInput
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            autoComplete="password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotLink}
        accessibilityRole="link"
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {error && <Text style={styles.globalError}>{error}</Text>}

      <AuthButton
        label="Entrar a Prixma"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.xl,
  },
  forgotText: {
    ...typography.small,
    color: colors.purple,
  },
  globalError: {
    ...typography.small,
    color: '#ff5e7d',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xs,
  },
});
