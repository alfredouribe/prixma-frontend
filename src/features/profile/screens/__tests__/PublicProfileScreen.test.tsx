import { render, screen } from '@testing-library/react-native';
import { PublicProfileScreen } from '../PublicProfileScreen';
import type { PublicProfile } from '../../types/profile.types';

const mockProfile: PublicProfile = {
  id: 'other-profile-uuid',
  display_name: 'Roberto',
  bio: 'Hola, soy Roberto.',
  city: 'Guadalajara',
  intention: 'friendship',
  photo_url: null,
  video_url: null,
  gender_identities: [],
  orientations: [],
  pronouns: [],
  interests: [],
  photos: [],
};

jest.mock('../../hooks/usePublicProfile', () => ({
  usePublicProfile: jest.fn(() => ({
    profile: mockProfile,
    isLoading: false,
    error: null,
  })),
}));

describe('PublicProfileScreen', () => {
  it('no muestra estadísticas en el perfil ajeno', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(screen.queryByText('Likes')).toBeNull();
    expect(screen.queryByText('Matches')).toBeNull();
    expect(screen.queryByText('Eventos')).toBeNull();
  });

  it('muestra el nombre del perfil', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(await screen.findByText('Roberto')).toBeTruthy();
  });

  it('muestra la bio', async () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(await screen.findByText('Hola, soy Roberto.')).toBeTruthy();
  });

  it('no muestra el botón Editar perfil', () => {
    render(<PublicProfileScreen uuid="other-profile-uuid" />);
    expect(screen.queryByText('Editar perfil')).toBeNull();
  });
});
