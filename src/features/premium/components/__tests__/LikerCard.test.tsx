import { fireEvent, render, screen } from '@testing-library/react-native';
import { LikerCard } from '../LikerCard';
import type { ExploreProfile } from '../../../matching/types/matching.types';

const mockProfile: ExploreProfile = {
  id: 'liker-uuid',
  display_name: 'Nubia',
  age: 26,
  pronouns: ['elle'],
  gender_identities: ['non_binary'],
  orientations: ['queer'],
  city: 'CDMX',
  bio: null,
  intention: 'friendship',
  is_verified: true,
  has_video: false,
  interests: [],
  photos: [{ id: 'p1', url: 'https://s3.example.com/photo.jpg', position: 1 }],
};

describe('LikerCard', () => {
  it('muestra nombre y edad del perfil', () => {
    render(<LikerCard profile={mockProfile} onLike={jest.fn()} />);

    expect(screen.getByText('Nubia, 26')).toBeTruthy();
  });

  it('al presionar el botón de like, llama a onLike con el perfil', () => {
    const onLike = jest.fn();
    render(<LikerCard profile={mockProfile} onLike={onLike} />);

    fireEvent.press(screen.getByTestId('liker-like-btn-liker-uuid'));

    expect(onLike).toHaveBeenCalledWith(mockProfile);
  });

  it('deshabilita el botón de like mientras isLiking es true', () => {
    const onLike = jest.fn();
    render(<LikerCard profile={mockProfile} onLike={onLike} isLiking={true} />);

    fireEvent.press(screen.getByTestId('liker-like-btn-liker-uuid'));

    expect(onLike).not.toHaveBeenCalled();
  });

  it('sin fotos, muestra un placeholder en vez de romper', () => {
    render(<LikerCard profile={{ ...mockProfile, photos: [] }} onLike={jest.fn()} />);

    expect(screen.getByText('Nubia, 26')).toBeTruthy();
  });
});
