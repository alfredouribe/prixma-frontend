import { act, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { GeoBlockMap } from '../GeoBlockMap';

jest.mock('expo-location');

const mockRequestPermissions = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockGetCurrentPosition = Location.getCurrentPositionAsync as jest.Mock;

describe('GeoBlockMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el mapa cuando la ubicación se obtiene correctamente', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPosition.mockResolvedValue({
      coords: { latitude: 19.4326, longitude: -99.1332 },
    });

    render(<GeoBlockMap visible isSaving={false} onSave={jest.fn()} onClose={jest.fn()} />);

    expect(await screen.findByTestId('map-view')).toBeTruthy();
  });

  it('muestra el error de ubicación si el permiso es denegado', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    render(<GeoBlockMap visible isSaving={false} onSave={jest.fn()} onClose={jest.fn()} />);

    expect(await screen.findByText('No se pudo obtener tu ubicación.')).toBeTruthy();
  });

  it('no se queda pensando para siempre si la ubicación nunca resuelve (bug real: se quedaba cargando)', async () => {
    jest.useFakeTimers();
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    // Simula el dispositivo sin fix de ubicación — la promesa nunca se
    // resuelve ni rechaza por sí sola, como el AVD reportado por el humano.
    mockGetCurrentPosition.mockReturnValue(new Promise(() => {}));

    render(<GeoBlockMap visible isSaving={false} onSave={jest.fn()} onClose={jest.fn()} />);

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    await waitFor(() => expect(screen.getByText('No se pudo obtener tu ubicación.')).toBeTruthy());

    jest.useRealTimers();
  });
});
