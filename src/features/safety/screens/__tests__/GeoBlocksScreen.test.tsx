import { render, screen } from '@testing-library/react-native';
import { GeoBlocksScreen } from '../GeoBlocksScreen';
import { useGeoBlocks } from '../../hooks/useGeoBlocks';
import type { GeoBlock } from '../../types/safety.types';

jest.mock('../../hooks/useGeoBlocks');

function buildGeoBlock(overrides: Partial<GeoBlock> = {}): GeoBlock {
  return {
    id: 'geo-1',
    label: 'Casa',
    latitude: 19.4,
    longitude: -99.1,
    radius_km: 5,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('GeoBlocksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título de la pantalla y el botón de agregar zona', () => {
    (useGeoBlocks as jest.Mock).mockReturnValue({
      geoBlocks: [buildGeoBlock()],
      isLoading: false,
      error: null,
      createGeoBlock: jest.fn(),
      deleteGeoBlock: jest.fn(),
      reload: jest.fn(),
    });

    render(<GeoBlocksScreen />);

    expect(screen.getByText('Bloqueo geográfico')).toBeTruthy();
    expect(screen.getByText('Agregar zona')).toBeTruthy();
  });

  it('muestra el estado vacío cuando no hay zonas', () => {
    (useGeoBlocks as jest.Mock).mockReturnValue({
      geoBlocks: [],
      isLoading: false,
      error: null,
      createGeoBlock: jest.fn(),
      deleteGeoBlock: jest.fn(),
      reload: jest.fn(),
    });

    render(<GeoBlocksScreen />);

    expect(screen.getByText('No tienes zonas de bloqueo geográfico')).toBeTruthy();
  });
});
