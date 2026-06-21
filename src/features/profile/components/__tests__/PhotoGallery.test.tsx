import { render, screen } from '@testing-library/react-native';
import { PhotoGallery } from '../PhotoGallery';
import type { ProfilePhoto } from '../../types/profile.types';

function makePhotos(count: number): ProfilePhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    url: `https://s3.example.com/photo${i + 1}.jpg`,
    position: i + 1,
  }));
}

describe('PhotoGallery', () => {
  it('muestra el botón + cuando hay menos de 6 fotos', () => {
    render(<PhotoGallery photos={makePhotos(3)} editable onAdd={jest.fn()} />);
    expect(screen.getByTestId('add-photo-btn')).toBeTruthy();
  });

  it('no muestra el botón + cuando hay 6 fotos', () => {
    render(<PhotoGallery photos={makePhotos(6)} editable onAdd={jest.fn()} />);
    expect(screen.queryByTestId('add-photo-btn')).toBeNull();
  });

  it('no muestra el botón + cuando no es editable', () => {
    render(<PhotoGallery photos={makePhotos(2)} editable={false} />);
    expect(screen.queryByTestId('add-photo-btn')).toBeNull();
  });

  it('muestra botón de eliminar para cada foto en modo editable', () => {
    const photos = makePhotos(3);
    render(<PhotoGallery photos={photos} editable onDelete={jest.fn()} />);
    photos.forEach((photo) => {
      expect(screen.getByTestId(`delete-photo-${photo.id}`)).toBeTruthy();
    });
  });

  it('no muestra botones de eliminar cuando no es editable', () => {
    const photos = makePhotos(2);
    render(<PhotoGallery photos={photos} editable={false} />);
    photos.forEach((photo) => {
      expect(screen.queryByTestId(`delete-photo-${photo.id}`)).toBeNull();
    });
  });
});
