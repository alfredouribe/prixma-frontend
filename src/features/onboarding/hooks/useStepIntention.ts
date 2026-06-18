import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingService } from '../services/onboardingService';
import { intentionSchema, type IntentionFormData } from '../schemas/intentionSchema';
import { extractApiError } from '../../../lib/extractApiError';

export function useStepIntention() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
  });

  async function handleSubmit(data: IntentionFormData) {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveIntention(data);
      router.push('/(onboarding)/interests');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { form, handleSubmit: form.handleSubmit(handleSubmit), isLoading, error };
}
