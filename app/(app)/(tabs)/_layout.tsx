import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, surfaces, text } from '../../../src/lib/theme';

/**
 * Tab navigator con las 4 pestañas visibles de la app. Las pantallas de
 * detalle (match/[id], chat/[id], user/[uuid]) NO viven aquí — están un
 * nivel arriba, como rutas hermanas de este grupo dentro del <Stack> de
 * app/(app)/_layout.tsx. Así, navegar a una de ellas empuja una pantalla
 * de Stack sobre las tabs en vez de cambiar el foco de este tab navigator,
 * y el botón atrás vuelve exactamente a la tab que estaba activa antes.
 * Ver nota en app/(app)/_layout.tsx.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: surfaces.elevated,
          borderTopColor: surfaces.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: text.tertiary,
        tabBarLabelStyle: {
          fontFamily: 'PoppinsRounded-Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi perfil',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
