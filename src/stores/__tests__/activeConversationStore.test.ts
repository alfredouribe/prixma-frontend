import { useActiveConversationStore } from '../activeConversationStore';

beforeEach(() => {
  useActiveConversationStore.setState({ activeConversationId: null });
});

describe('activeConversationStore', () => {
  it('setActiveConversation fija el id de la conversación abierta', () => {
    useActiveConversationStore.getState().setActiveConversation('conv-1');

    expect(useActiveConversationStore.getState().activeConversationId).toBe('conv-1');
  });

  it('clearActiveConversation limpia el id cuando coincide con el que se pide limpiar', () => {
    useActiveConversationStore.getState().setActiveConversation('conv-1');

    useActiveConversationStore.getState().clearActiveConversation('conv-1');

    expect(useActiveConversationStore.getState().activeConversationId).toBeNull();
  });

  it('clearActiveConversation no limpia el id si ya cambió a otra conversación (desmontaje tardío)', () => {
    useActiveConversationStore.getState().setActiveConversation('conv-1');
    useActiveConversationStore.getState().setActiveConversation('conv-2');

    // Simula el cleanup tardío de una pantalla vieja que el Stack nativo
    // mantuvo montada — no debe pisar la conversación realmente activa.
    useActiveConversationStore.getState().clearActiveConversation('conv-1');

    expect(useActiveConversationStore.getState().activeConversationId).toBe('conv-2');
  });
});
