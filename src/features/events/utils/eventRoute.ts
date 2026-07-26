// Expo Router (typed routes) exige la forma `{ pathname, params }` para
// rutas dinámicas — mismo criterio que `features/chat/utils/conversationRoute.ts`.
export function eventDetailRoute(eventId: string) {
  return {
    pathname: '/(app)/event/[id]' as const,
    params: { id: eventId },
  };
}
