import { useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackService } from '../services/feedbackService';
import { feedbackSchema, type FeedbackFormData } from '../schemas/feedbackSchema';
import { extractApiError } from '../../../lib/extractApiError';

/**
 * React Hook Form + Zod (mismo patrón que `useEditProfile.ts`): el hook
 * posee el `form` completo y expone `handleSubmit` ya compuesto con
 * `form.handleSubmit(onSubmit)`. `app_version`/`platform` se agregan aquí
 * de forma automática — nunca se le piden al usuario (mismo patrón de
 * `useRegisterPushToken.ts` para `platform`).
 */
export function useSubmitFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { type: 'bug', message: '' },
  });

  async function onSubmit(data: FeedbackFormData) {
    setIsSubmitting(true);
    setError(null);
    try {
      const platform: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';
      await feedbackService.submit({
        ...data,
        app_version: Constants.expoConfig?.version,
        platform,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isSuccess,
    error,
  };
}
