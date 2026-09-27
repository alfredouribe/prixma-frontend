import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../src/stores/authStore';
import { authService } from '../src/features/auth/services/authService';
import { usePushNotificationRouter } from '../src/features/notifications/hooks/usePushNotificationRouter';
import { useConfigurePurchases } from '../src/features/subscriptions/hooks/useConfigurePurchases';

SplashScreen.preventAutoHideAsync();

// Aquí y no en App.tsx — este proyecto usa Expo Router (`index.ts` →
// `expo-router/entry`), App.tsx nunca se ejecuta. El wizard de Sentry generó
// un App.tsx genérico con este mismo Sentry.init() sin darse cuenta de que
// era código muerto (2026-09-26) — borrado, la config real vive aquí.
Sentry.init({
  dsn: 'https://81151fdd14e0292e3dce36bf1515b7bd@o4512156526379008.ingest.us.sentry.io/4512156544270336',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PoppinsRounded-Regular':  require('../assets/fonts/Poppins-Regular.ttf'),
    'PoppinsRounded-Medium':   require('../assets/fonts/Poppins-Medium.ttf'),
    'PoppinsRounded-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'PoppinsRounded-Bold':     require('../assets/fonts/Poppins-Bold.ttf'),
  });

  const [authReady, setAuthReady] = useState(false);
  const { restoreAuth, setAuth } = useAuthStore();
  const { configurePurchases } = useConfigurePurchases();

  useEffect(() => {
    async function bootstrap() {
      const token = await restoreAuth();
      if (token) {
        try {
          const user = await authService.getMe();
          await setAuth(user, token);
          // Best-effort, nunca bloquea el arranque — este es el camino más
          // común de uso real (usuario que ya tenía sesión reabre la app),
          // así que RevenueCat necesita configurarse aquí y no solo en
          // useLogin.ts (login interactivo). Ver
          // features/subscriptions/specs/plan.md → "Dónde vive
          // Purchases.configure()".
          configurePurchases(user.id).catch(() => {});
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

export default Sentry.wrap(RootLayout);
