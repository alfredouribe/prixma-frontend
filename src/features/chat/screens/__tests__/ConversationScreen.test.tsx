import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ConversationScreen } from '../ConversationScreen';
import { useConversation } from '../../hooks/useConversation';
import { useBlocks } from '../../../safety/hooks/useBlocks';
import { useReport } from '../../../safety/hooks/useReport';
import { useReportEvidence } from '../../../safety/hooks/useReportEvidence';
import { usePremiumSettings } from '../../../premium/hooks/usePremiumSettings';
import type { Conversation } from '../../types/chat.types';

// Factory explícito (no automock): automock forzaría a Jest a cargar el
// módulo real de `useConversation` para introspectarlo, lo que ejecutaría el
// `import Pusher from 'pusher-js/react-native'` real (vía `lib/echo`) y su
// dependencia nativa de NetInfo — rompe en el entorno de test (no hay
// binding nativo). Mismo patrón ya usado en useConversation.test.ts.
jest.mock('../../hooks/useConversation', () => ({
  useConversation: jest.fn(),
}));
jest.mock('../../../safety/hooks/useBlocks');
jest.mock('../../../safety/hooks/useReport');
jest.mock('../../../safety/hooks/useReportEvidence');
// Sin mockear, dispararía una llamada real a `premiumService.getSettings()`
// (axios sin baseURL en test) — mismo criterio que el resto de los mocks de
// este archivo, evita red real y actualizaciones de estado fuera de `act()`.
jest.mock('../../../premium/hooks/usePremiumSettings');

function buildConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    type: 'match',
    status: 'active',
    other_user: { id: 'other-uuid', display_name: 'Alex', photo: null, pronouns: [] },
    last_message: null,
    unread_count: 0,
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-19T10:00:00Z',
    ...overrides,
  };
}

function mockUseConversation(overrides: Partial<ReturnType<typeof useConversation>> = {}) {
  (useConversation as jest.Mock).mockReturnValue({
    conversation: buildConversation(),
    messages: [],
    isLoading: false,
    isSending: false,
    isLoadingMore: false,
    hasMoreMessages: false,
    error: null,
    sendMessage: jest.fn(),
    loadOlderMessages: jest.fn(),
    ...overrides,
  });
}

describe('ConversationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConversation();
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [],
      isLoading: false,
      error: null,
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });
    (useReport as jest.Mock).mockReturnValue({
      submitReport: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    (useReportEvidence as jest.Mock).mockReturnValue({
      profile: null,
      chatMessages: [],
      chatTotal: null,
      isLoading: false,
    });
    // `settings: null` → `ChatAdOverlay` nunca se renderiza (gate explícito
    // en ConversationScreen.tsx sobre `settings?.chat_ad_video_url`).
    (usePremiumSettings as jest.Mock).mockReturnValue({
      settings: null,
      isLoading: false,
      error: null,
    });
  });

  it('abre el menú ⋯ y muestra las 3 opciones', () => {
    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));

    expect(screen.getByTestId('menu-option-view-profile')).toBeTruthy();
    expect(screen.getByTestId('menu-option-report')).toBeTruthy();
    expect(screen.getByTestId('menu-option-block')).toBeTruthy();
  });

  it('al tocar "Ver perfil" navega con el uuid correcto del otro usuario', () => {
    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-view-profile'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(app)/user/[uuid]',
      params: { uuid: 'other-uuid' },
    });
  });

  it('al tocar "Reportar" abre el ReportModal', () => {
    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-report'));

    expect(screen.getByText('Reportar perfil')).toBeTruthy();
  });

  it('al tocar "Bloquear" y confirmar, llama blockUser y navega a la bandeja de Chats', async () => {
    const blockUser = jest.fn().mockResolvedValue({
      id: 'block-1',
      blocked_user: { id: 'other-uuid', display_name: 'Alex', photo: null },
      created_at: '2026-07-19T10:00:00Z',
    });
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [],
      isLoading: false,
      error: null,
      blockUser,
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });

    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-block'));
    fireEvent.press(screen.getByTestId('block-confirm-btn'));

    await waitFor(() => expect(blockUser).toHaveBeenCalledWith('other-uuid'));
    expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/chats');
  });

  it('si el bloqueo falla, muestra el error y no navega', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const blockUser = jest.fn().mockResolvedValue(null);
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [],
      isLoading: false,
      error: 'Algo salió mal. Revisa tu conexión e intenta de nuevo.',
      blockUser,
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });

    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-block'));
    fireEvent.press(screen.getByTestId('block-confirm-btn'));

    await waitFor(() => expect(blockUser).toHaveBeenCalled());
    expect(alertSpy).toHaveBeenCalledWith('', 'Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('al reportar y confirmar, navega de vuelta a Chats', async () => {
    const submitReport = jest.fn().mockResolvedValue(true);
    (useReport as jest.Mock).mockReturnValue({ submitReport, isLoading: false, error: null });

    render(<ConversationScreen conversationId="conv-1" />);

    fireEvent.press(screen.getByTestId('conversation-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-report'));
    fireEvent.press(screen.getByTestId('report-reason-harassment'));
    await waitFor(() => {
      fireEvent.press(screen.getByTestId('report-submit-btn'));
    });

    await waitFor(() => expect(screen.getByTestId('report-done-btn')).toBeTruthy());
    fireEvent.press(screen.getByTestId('report-done-btn'));

    expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/chats');
  });

  describe('ad de chat (Premium)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('muestra el ChatAdOverlay tras `free_chat_minutes_before_ad` minutos si no es premium y hay video configurado', () => {
      (usePremiumSettings as jest.Mock).mockReturnValue({
        settings: {
          is_premium: false,
          free_swipes_per_ad: 5,
          free_likes_per_day: 5,
          free_chat_minutes_before_ad: 1,
          chat_ad_video_url: 'https://s3.example.com/ad.mp4',
        },
        isLoading: false,
        error: null,
      });

      render(<ConversationScreen conversationId="conv-1" />);

      expect(screen.queryByTestId('chat-ad-overlay')).toBeNull();

      act(() => {
        jest.advanceTimersByTime(60_000);
      });

      expect(screen.getByTestId('chat-ad-overlay')).toBeTruthy();
    });

    it('no muestra el overlay si el usuario es premium, aunque haya video configurado', () => {
      (usePremiumSettings as jest.Mock).mockReturnValue({
        settings: {
          is_premium: true,
          free_swipes_per_ad: 5,
          free_likes_per_day: 5,
          free_chat_minutes_before_ad: 1,
          chat_ad_video_url: 'https://s3.example.com/ad.mp4',
        },
        isLoading: false,
        error: null,
      });

      render(<ConversationScreen conversationId="conv-1" />);

      act(() => {
        jest.advanceTimersByTime(5 * 60_000);
      });

      expect(screen.queryByTestId('chat-ad-overlay')).toBeNull();
    });

    it('no muestra el overlay si no hay chat_ad_video_url configurado', () => {
      (usePremiumSettings as jest.Mock).mockReturnValue({
        settings: {
          is_premium: false,
          free_swipes_per_ad: 5,
          free_likes_per_day: 5,
          free_chat_minutes_before_ad: 1,
          chat_ad_video_url: null,
        },
        isLoading: false,
        error: null,
      });

      render(<ConversationScreen conversationId="conv-1" />);

      act(() => {
        jest.advanceTimersByTime(5 * 60_000);
      });

      expect(screen.queryByTestId('chat-ad-overlay')).toBeNull();
    });
  });
});
