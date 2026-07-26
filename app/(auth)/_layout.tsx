import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated) {
    return <Redirect href={user?.onboarding_completed ? '/(app)/(tabs)' : '/(onboarding)/identity'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
