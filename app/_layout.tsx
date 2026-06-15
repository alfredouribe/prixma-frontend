import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/authStore';
import { authService } from '../src/features/auth/services/authService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PoppinsRounded-Regular':  require('../brand/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'PoppinsRounded-Medium':   require('../brand/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'PoppinsRounded-SemiBold': require('../brand/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'PoppinsRounded-Bold':     require('../brand/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  const [authReady, setAuthReady] = useState(false);
  const { restoreAuth, setAuth } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      const token = await restoreAuth();
      if (token) {
        try {
          const user = await authService.getMe();
          await setAuth(user, token);
        } catch {
          // Token inválido o expirado — se queda en (auth)
        }
      }
      setAuthReady(true);
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
