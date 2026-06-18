import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  if (!user?.onboarding_completed) {
    return <Redirect href="/(onboarding)/identity" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
