import { create } from 'zustand';

/**
 * Qué conversación está abierta en pantalla ahora mismo (`ConversationScreen`
 * montada). Compartido entre `useConversation` (quien la fija/limpia al
 * montar/desmontar) y `useIncomingMessageToast` (listener global que la
 * consulta para decidir si debe mostrar el toast in-app de mensaje nuevo —
 * si el mensaje pertenece a la conversación ya abierta, no se muestra,
 * porque ya se ve aparecer en el hilo en tiempo real). Ver
 * features/chat/specs/plan.md → "Toast in-app de mensaje nuevo".
 *
 * Deliberadamente mínimo (un solo id, sin historial): ningún consumidor
 * necesita más que "¿qué conversación se ve ahora?".
 */
interface ActiveConversationState {
  activeConversationId: string | null;
  setActiveConversation: (conversationId: string) => void;
  clearActiveConversation: (conversationId: string) => void;
}

export const useActiveConversationStore = create<ActiveConversationState>((set, get) => ({
  activeConversationId: null,

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  // Recibe el id de quien limpia y solo borra si sigue siendo el activo —
  // evita que el desmontaje de una pantalla vieja (Stack nativo puede
  // mantener pantallas anteriores montadas al navegar) pise el id de una
  // conversación distinta que ya se abrió después.
  clearActiveConversation: (conversationId) => {
    if (get().activeConversationId === conversationId) {
      set({ activeConversationId: null });
    }
  },
}));
