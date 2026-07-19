import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CityPicker } from '../CityPicker';
import { searchPlace, reverseGeocode } from '../../../../lib/nominatim';
import * as Location from 'expo-location';

jest.mock('../../../../lib/nominatim');
jest.mock('expo-location');

const mockSearchPlace = searchPlace as jest.Mock;
const mockReverseGeocode = reverseGeocode as jest.Mock;
const mockRequestPermissions = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockGetCurrentPosition = Location.getCurrentPositionAsync as jest.Mock;

/**
 * `CityPicker` es un componente controlado: la búsqueda se dispara vía `useEffect` sobre
 * el prop `value`, igual que lo consume `EditProfileScreen` con React Hook Form. Este
 * harness simula ese mismo ciclo (padre con estado que re-renderiza con el nuevo valor).
 */
function Harness({
  initialValue = '',
  initialLatitude = null,
  initialLongitude = null,
  onChangeSpy,
}: {
  initialValue?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onChangeSpy: jest.Mock;
}) {
  const [value, setValue] = useState(initialValue);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude);

  return (
    <CityPicker
      value={value}
      latitude={latitude}
      longitude={longitude}
      onChange={(city, lat, lng) => {
        setValue(city);
        setLatitude(lat);
        setLongitude(lng);
        onChangeSpy(city, lat, lng);
      }}
    />
  );
}

describe('CityPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchPlace.mockResolvedValue([]);
    mockReverseGeocode.mockResolvedValue(null);
  });

  it('seleccionar una sugerencia guarda el nombre y las coordenadas', async () => {
    mockSearchPlace.mockResolvedValue([
      { display_name: 'Ciudad de México, México', lat: '19.4326', lon: '-99.1332' },
    ]);
    const onChangeSpy = jest.fn();

    render(<Harness onChangeSpy={onChangeSpy} />);

    fireEvent.changeText(screen.getByTestId('city-picker-input'), 'Ciudad de Mex');

    await waitFor(() => expect(mockSearchPlace).toHaveBeenCalledWith('Ciudad de Mex'), {
      timeout: 2000,
    });

    const suggestion = await screen.findByText('Ciudad de México, México');
    fireEvent.press(suggestion);

    expect(onChangeSpy).toHaveBeenLastCalledWith('Ciudad de México, México', 19.4326, -99.1332);
  });

  it('muestra "No se encontraron resultados" cuando la búsqueda no arroja resultados', async () => {
    mockSearchPlace.mockResolvedValue([]);
    const onChangeSpy = jest.fn();

    render(<Harness onChangeSpy={onChangeSpy} />);

    fireEvent.changeText(screen.getByTestId('city-picker-input'), 'zzzz');

    await waitFor(() => expect(mockSearchPlace).toHaveBeenCalledWith('zzzz'), { timeout: 2000 });

    expect(await screen.findByText('No se encontraron resultados')).toBeTruthy();
  });

  it('editar el texto después de seleccionar descarta las coordenadas previas', () => {
    const onChangeSpy = jest.fn();

    render(
      <Harness
        initialValue="Ciudad de México, México"
        initialLatitude={19.4326}
        initialLongitude={-99.1332}
        onChangeSpy={onChangeSpy}
      />,
    );

    fireEvent.changeText(screen.getByTestId('city-picker-input'), 'Ciudad de México, Méx');

    expect(onChangeSpy).toHaveBeenCalledWith('Ciudad de México, Méx', null, null);
  });

  it('el botón de ubicación actual pide permiso, geocodifica y rellena el campo', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPosition.mockResolvedValue({
      coords: { latitude: 20.6597, longitude: -103.3496 },
    });
    mockReverseGeocode.mockResolvedValue({
      display_name: 'Guadalajara, México',
      lat: '20.6597',
      lon: '-103.3496',
    });
    const onChangeSpy = jest.fn();

    render(<Harness onChangeSpy={onChangeSpy} />);

    fireEvent.press(screen.getByTestId('city-picker-use-location'));

    await waitFor(() => {
      expect(mockRequestPermissions).toHaveBeenCalled();
      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(mockReverseGeocode).toHaveBeenCalledWith(20.6597, -103.3496);
    });

    expect(onChangeSpy).toHaveBeenCalledWith('Guadalajara, México', 20.6597, -103.3496);
  });

  it('muestra el error de ubicación si el permiso es denegado', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    const onChangeSpy = jest.fn();

    render(<Harness onChangeSpy={onChangeSpy} />);

    fireEvent.press(screen.getByTestId('city-picker-use-location'));

    expect(await screen.findByText('No se pudo obtener tu ubicación.')).toBeTruthy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
