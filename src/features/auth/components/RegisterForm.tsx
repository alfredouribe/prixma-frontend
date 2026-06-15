import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { TermsCheckbox } from './TermsCheckbox';
import { AgeInput } from './AgeInput';
import { text, spacing, typography } from '../../../lib/theme';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
  error: string | null;
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirmation: '',
      date_of_birth: '',
      terms_accepted: false,
      privacy_accepted: false,
    },
  });

  const termsAccepted = watch('terms_accepted');
  const privacyAccepted = watch('privacy_accepted');
  const submitDisabled = !termsAccepted || !privacyAccepted;

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

      <Controller
        control={control}
        name="date_of_birth"
        render={({ field }) => (
          <AgeInput
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.date_of_birth?.message}
          />
        )}
      />

      <Text style={styles.termsIntro}>
        Antes de continuar, necesitamos que leas y aceptes nuestros documentos. Están escritos en
        lenguaje claro, sin letra pequeña.
      </Text>

      <Controller
        control={control}
        name="terms_accepted"
        render={({ field }) => (
          <TermsCheckbox
            label="Acepto los Términos de uso de Prixma"
            value={field.value}
            onChange={field.onChange}
            error={errors.terms_accepted?.message}
            testID="terms-checkbox"
          />
        )}
      />

      <Controller
        control={control}
        name="privacy_accepted"
        render={({ field }) => (
          <TermsCheckbox
            label="Acepto la Política de privacidad y el manejo de mis datos"
            value={field.value}
            onChange={field.onChange}
            error={errors.privacy_accepted?.message}
            testID="privacy-checkbox"
          />
        )}
      />

      {error && <Text style={styles.globalError}>{error}</Text>}

      <AuthButton
        label="Crear mi cuenta"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        disabled={submitDisabled}
        testID="submit-button"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  termsIntro: {
    ...typography.small,
    color: text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  globalError: {
    ...typography.small,
    color: '#ff5e7d',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
});
