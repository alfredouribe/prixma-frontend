import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingService } from '../services/onboardingService';
import { pronounsSchema, type PronounsFormData } from '../schemas/pronounsSchema';
import { extractApiError } from '../../../lib/extractApiError';

export function useStepPronouns() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PronounsFormData>({
    resolver: zodResolver(pronounsSchema),
    defaultValues: {
      pronoun_ids: [],
      custom_pronouns: '',
      photo_url: null,
    },
  });

  async function handleSubmit(data: PronounsFormData) {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.savePronouns(data);
      router.push('/(onboarding)/intention');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { form, handleSubmit: form.handleSubmit(handleSubmit), isLoading, error };
}
