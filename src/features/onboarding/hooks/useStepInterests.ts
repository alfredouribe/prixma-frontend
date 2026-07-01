import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingService } from '../services/onboardingService';
import { interestsSchema, type InterestsFormData } from '../schemas/interestsSchema';
import { extractApiError } from '../../../lib/extractApiError';

export function useStepInterests() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InterestsFormData>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interest_ids: [],
      custom_interests: [],
    },
  });

  async function onSubmit(data: InterestsFormData) {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveInterests({
        interest_ids: data.interest_ids,
        custom_interests: data.custom_interests.join(','),
      });
      router.push('/(onboarding)/video');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { form, handleSubmit: form.handleSubmit(onSubmit), isLoading, error };
}
