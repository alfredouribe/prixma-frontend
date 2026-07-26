import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

/**
 * Punto de entrada de todo el grupo (app): guard de auth/onboarding, y
 * debajo un <Stack> que envuelve al tab navigator (grupo (tabs)) como una
 * ruta hermana de las pantallas de detalle (match/[id], chat/[id],
 * user/[uuid]).
 *
 * Por qué: antes, esas 3 pantallas de detalle vivían como <Tabs.Screen>
 * ocultas (href: null + tabBarStyle: 'none') dentro del mismo tab
 * navigator que explore/events/chats/profile. Aunque estuvieran ocultas
 * de la barra, seguían siendo tabs de ESE navigator — navegar a chat/[id]
 * cambiaba el foco del tab navigator hacia esa tab oculta, y el botón
 * atrás pasaba a depender del backBehavior del propio Tabs en vez de
 * simplemente "la pantalla anterior en el stack". Resultado: volver de
 * un chat regresaba a "Explorar" (la tab por defecto) en vez de "Chats"
 * (la tab desde la que en realidad se navegó).
 *
 * Con match/[id]/chat/[id]/user/[uuid] como Stack.Screen hermanas de
 * "(tabs)" — fuera del tab navigator por completo — navegar a una de
 * ellas empuja una pantalla nueva sobre este <Stack>, sin tocar el
 * estado del tab navigator. El grupo "(tabs)" permanece montado, con la
 * tab que estaba activa (aquí, "Chats") intacta debajo. router.back()
 * simplemente hace pop de este Stack y vuelve a mostrar "(tabs)" tal
 * como estaba, con "Chats" todavía enfocada.
 */
export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  if (!user?.onboarding_completed) {
    return <Redirect href="/(onboarding)/identity" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="user/[uuid]" />
      <Stack.Screen name="event/[id]" />
    </Stack>
  );
}
