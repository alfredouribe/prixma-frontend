import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/resetPasswordSchema';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { text, spacing, typography } from '../../../lib/theme';

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void;
  isLoading: boolean;
  error: string | null;
}

export function ResetPasswordForm({ onSubmit, isLoading, error }: ResetPasswordFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', email: '', password: '', password_confirmation: '' },
  });

  return (
    <View>
      <Controller
        control={control}
        name="token"
        render={({ field }) => (
          <AuthInput
            label="Código de recuperación"
            icon="key-outline"
            placeholder="Tu código"
            autoCapitalize="none"
            autoComplete="one-time-code"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.token?.message}
          />
        )}
      />

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
            label="Nueva contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            hint="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password_confirmation"
        render={({ field }) => (
          <AuthInput
            label="Confirmar contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••"
            isPassword
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password_confirmation?.message}
          />
        )}
      />

      {error && <Text style={styles.globalError}>{error}</Text>}

      <AuthButton
        label="Actualizar mi contraseña"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  globalError: {
    ...typography.small,
    color: '#ff5e7d',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
