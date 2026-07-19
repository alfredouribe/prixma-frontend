import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { PublicProfileScreen } from '../PublicProfileScreen';
import { useBlocks } from '../../../safety/hooks/useBlocks';
import { chatService } from '../../../chat/services/chatService';
import type { PublicProfile } from '../../types/profile.types';
import type { Conversation } from '../../../chat/types/chat.types';

function buildProfile(overrides: Partial<PublicProfile> = {}): PublicProfile {
  return {
    id: 'other-profile-uuid',
    display_name: 'Roberto',
    age: 29,
    bio: 'Hola, soy Roberto.',
    city: 'Guadalajara',
    intention: 'friendship',
    photo_url: null,
    video_url: null,
    has_video: false,
    custom_interests: null,
    is_verified: false,
    gender_identities: [],
    orientations: [],
    pronouns: [],
    interests: [],
    photos: [],
    ...overrides,
  };
}

const mockProfile = buildProfile();

function buildConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    type: 'match',
    status: 'active',
    other_user: { id: 'other-profile-uuid', display_name: 'Roberto', photo: null, pronouns: [] },
    last_message: null,
    unread_count: 0,
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-19T10:00:00Z',
    ...overrides,
  };
}

jest.mock('../../hooks/usePublicProfile', () => ({
  usePublicProfile: jest.fn(() => ({
    profile: mockProfile,
    isLoading: false,
    error: null,
  })),
}));

jest.mock('../../../safety/hooks/useBlocks');
jest.mock('../../../chat/services/chatService');

describe('PublicProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBlocks as jest.Mock).mockReturnValue({
      blocks: [],
      isLoading: false,
      error: null,
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
      reload: jest.fn(),
    });
    // Default: ya existe match/conversación — la mayoría de los tests no le
    // interesa el botón "Enviar mensaje". Los tests que sí lo prueban
    // sobreescriben este mock explícitamente.
    (chatService.getConversationWithUser as jest.Mock).mockResolvedValue(buildConversation());
  });

  it('no muestra estadísticas en el perfil ajeno', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(screen.queryByText('Likes')).toBeNull();
    expect(screen.queryByText('Matches')).toBeNull();
    expect(screen.queryByText('Eventos')).toBeNull();
  });

  it('muestra el nombre y la edad del perfil', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(await screen.findByText('Roberto, 29')).toBeTruthy();
  });

  it('muestra la bio', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(await screen.findByText('Hola, soy Roberto.')).toBeTruthy();
  });

  it('no muestra el botón Editar perfil', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(screen.queryByText('Editar perfil')).toBeNull();
  });

  it('muestra el botón "Enviar mensaje" cuando ya existe una conversación (match)', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(await screen.findByText('Enviar mensaje')).toBeTruthy();
  });

  it('no muestra el botón "Enviar mensaje" cuando no hay match', async () => {
    (chatService.getConversationWithUser as jest.Mock).mockResolvedValue(null);
    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    await waitFor(() => expect(chatService.getConversationWithUser).toHaveBeenCalled());
    expect(screen.queryByText('Enviar mensaje')).toBeNull();
  });

  it('al tocar "Enviar mensaje" navega a la conversación existente', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    fireEvent.press(await screen.findByTestId('send-message-btn'));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(app)/chat/[id]',
        params: { id: 'conv-1' },
      }),
    );
  });

  it('no muestra el bloque de video si has_video es false', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(screen.queryByTestId('video-locked-teaser')).toBeNull();
  });

  it('muestra el teaser de video (sin reproducir) si has_video es true y no hay match', () => {
    (require('../../hooks/usePublicProfile').usePublicProfile as jest.Mock).mockReturnValue({
      profile: buildProfile({ has_video: true, video_url: null }),
      isLoading: false,
      error: null,
    });

    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    expect(screen.getByTestId('video-locked-teaser')).toBeTruthy();
    expect(
      screen.getByText('¿Quieres saber más de mí? Empieza por mi video de presentación.'),
    ).toBeTruthy();
  });

  it('abre el menú de opciones y muestra Bloquear/Reportar', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    fireEvent.press(screen.getByTestId('profile-menu-btn'));

    expect(screen.getByTestId('menu-option-block')).toBeTruthy();
    expect(screen.getByTestId('menu-option-report')).toBeTruthy();
  });

  it('abre el BlockModal desde la opción Bloquear del menú', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    fireEvent.press(screen.getByTestId('profile-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-block'));

    expect(screen.getByText('¿Bloquear a Roberto?')).toBeTruthy();
  });

  it('abre el ReportModal desde la opción Reportar del menú', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);

    fireEvent.press(screen.getByTestId('profile-menu-btn'));
    fireEvent.press(screen.getByTestId('menu-option-report'));

    expect(screen.getByText('Reportar perfil')).toBeTruthy();
  });
});
