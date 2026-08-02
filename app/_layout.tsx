import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { authService } from '../src/features/auth/services/authService';
import { usePushNotificationRouter } from '../src/features/notifications/hooks/usePushNotificationRouter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PoppinsRounded-Regular':  require('../assets/fonts/Poppins-Regular.ttf'),
    'PoppinsRounded-Medium':   require('../assets/fonts/Poppins-Medium.ttf'),
    'PoppinsRounded-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'PoppinsRounded-Bold':     require('../assets/fonts/Poppins-Bold.ttf'),
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

  // Deep link de push (tap en background / cold start) + supresión del
  // banner nativo en foreground. `enabled` se queda en `false` hasta que
  // la navegación raíz esté lista, para no navegar antes de que el
  // <Stack> exista — ver usePushNotificationRouter.ts.
  usePushNotificationRouter(fontsLoaded && authReady);

  if (!fontsLoaded || !authReady) return null;

  return (
    // SafeAreaProvider agregado 2026-08-02 — antes no existía en ningún
    // punto del árbol, así que `useSafeAreaInsets()` (el hook) lanzaba en
    // tiempo real ("No safe area value available...", no solo en tests);
    // solo el componente `<SafeAreaView>` funcionaba (tiene su propio
    // fallback nativo sin Provider, por eso el resto de la app ya lo usaba
    // sin problema). Necesario para que la barra de tabs calcule su alto
    // real respetando la barra de gestos de Android — ver
    // app/(app)/(tabs)/_layout.tsx.
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
