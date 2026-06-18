import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingService } from '../services/onboardingService';
import { identitySchema, type IdentityFormData } from '../schemas/identitySchema';
import { extractApiError } from '../../../lib/extractApiError';

export function useStepIdentity() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      display_name: '',
      gender_identity_ids: [],
      custom_gender_identity: '',
      orientation_ids: [],
      custom_orientation: '',
    },
  });

  async function handleSubmit(data: IdentityFormData) {
    setIsLoading(true);
    setError(null);
    try {
      await onboardingService.saveIdentity(data);
      router.push('/(onboarding)/pronouns');
    } catch (err) {
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { form, handleSubmit: form.handleSubmit(handleSubmit), isLoading, error };
}
