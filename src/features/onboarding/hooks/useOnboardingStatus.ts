import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { onboardingService } from '../services/onboardingService';
import type { OnboardingStatus } from '../types/onboarding.types';

const STEP_ROUTES = [
  '/(onboarding)/identity',
  '/(onboarding)/identity',
  '/(onboarding)/pronouns',
  '/(onboarding)/intention',
  '/(onboarding)/interests',
  '/(onboarding)/video',
  '/(onboarding)/safety',
] as const;

export function useOnboardingStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onboardingService
      .getStatus()
      .then((s) => {
        setStatus(s);
        const targetStep = Math.min(s.current_step, STEP_ROUTES.length - 1);
        router.replace(STEP_ROUTES[targetStep]);
      })
      .catch(() => {
        router.replace('/(onboarding)/identity');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { status, isLoading };
}
