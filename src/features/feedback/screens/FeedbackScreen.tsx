import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import type { FeedbackType } from '../types/feedback.types';

// Copy exacto: brand/copies.md → "Mi perfil" → "Reportar un problema".
const SCREEN_TITLE = 'Reportar un problema';
const SCREEN_SUBTITLE = 'Tu opinión nos ayuda a mejorar Prixma.';
const BACK_LABEL = 'Volver';
const MESSAGE_LABEL = '¿Qué pasó?';
const MESSAGE_PLACEHOLDER = 'Cuéntanos con el mayor detalle posible...';
const SUBMIT_LABEL = 'Enviar';
const CONFIRM_TITLE = '¡Gracias por tu mensaje!';
const CONFIRM_SUBTITLE = 'Lo revisaremos pronto.';
const CONFIRM_BUTTON = 'Volver a mi perfil';

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'comment', label: 'Comentario' },
];

/**
 * Screen de "Reportar un problema" — solo coordina, toda la lógica (RHF +
 * Zod, llamada al service, estados de envío) vive en `useSubmitFeedback`.
 * Header con el mismo patrón de `SubscriptionScreen.tsx` (back + título
 * centrado + spacer para balancear). Tras un envío exitoso, el formulario
 * se reemplaza por el estado de confirmación (mismo criterio ya usado en
 * `ReportModal.tsx` para su pantalla de "Reporte enviado").
 */
export function FeedbackScreen() {
  const router = useRouter();
  const { form, handleSubmit, isSubmitting, isSuccess, error } = useSubmitFeedback();
  const { control, formState: { errors }, watch } = form;

  const message = watch('message');
  const isSubmitDisabled = isSubmitting || !message?.trim().length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel={BACK_LABEL}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={text.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {SCREEN_TITLE}
        </Text>
        <View style={styles.backButton} />
      </View>

      {isSuccess ? (
        <View style={styles.confirmWrap} testID="feedback-confirmation">
          <Ionicons name="checkmark-circle" size={64} color={colors.green} style={styles.confirmIcon} />
          <Text style={styles.confirmTitle}>{CONFIRM_TITLE}</Text>
          <Text style={styles.confirmSubtitle}>{CONFIRM_SUBTITLE}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
            accessibilityRole="button"
            testID="feedback-confirm-back-btn"
          >
            <Text style={styles.primaryButtonText}>{CONFIRM_BUTTON}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>{SCREEN_SUBTITLE}</Text>

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <View style={styles.typeRow} testID="feedback-type-selector">
                {TYPE_OPTIONS.map((option) => {
                  const isSelected = field.value === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                      onPress={() => field.onChange(option.value)}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      testID={`feedback-type-${option.value}`}
                    >
                      <Text style={[styles.typeOptionText, isSelected && styles.typeOptionTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />

          <Text style={styles.label}>{MESSAGE_LABEL}</Text>
          <Controller
            control={control}
            name="message"
            render={({ field }) => (
              <TextInput
                style={styles.textArea}
                placeholder={MESSAGE_PLACEHOLDER}
                placeholderTextColor={text.tertiary}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                multiline
                maxLength={2000}
                textAlignVertical="top"
                testID="feedback-message-input"
              />
            )}
          />
          {errors.message && <Text style={styles.errorText}>{errors.message.message}</Text>}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitDisabled && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            testID="feedback-submit-btn"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>{SUBMIT_LABEL}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: text.primary,
    flex: 1,
    textAlign: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: surfaces.card,
    borderRadius: radius.full,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionSelected: {
    backgroundColor: colors.purple,
  },
  typeOptionText: {
    ...typography.label,
    color: text.tertiary,
  },
  typeOptionTextSelected: {
    color: colors.white,
  },
  label: {
    ...typography.label,
    color: text.secondary,
    marginTop: spacing.sm,
  },
  textArea: {
    minHeight: 140,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    backgroundColor: surfaces.card,
    color: text.primary,
    padding: spacing.md,
    ...typography.body,
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  confirmWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  confirmIcon: {
    marginBottom: spacing.xs,
  },
  confirmTitle: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  confirmSubtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
