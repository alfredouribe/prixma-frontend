// Expo Router (typed routes) exige la forma `{ pathname, params }` para
// rutas dinámicas — un template string (`/(app)/chat/${id}`) no matchea el
// tipo generado. Se centraliza aquí para que Profile (features/profile/hooks
// /useSendMessage.ts) y Chat (ConversationsScreen) no dupliquen el path.
export function conversationRoute(conversationId: string) {
  return {
    pathname: '/(app)/chat/[id]' as const,
    params: { id: conversationId },
  };
}
