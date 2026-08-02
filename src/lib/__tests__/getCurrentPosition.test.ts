import * as Location from 'expo-location';
import { getCurrentPositionWithTimeout } from '../getCurrentPosition';

jest.mock('expo-location');

const mockGetCurrentPosition = Location.getCurrentPositionAsync as jest.Mock;

describe('getCurrentPositionWithTimeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resuelve con la posición cuando expo-location responde a tiempo', async () => {
    mockGetCurrentPosition.mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });

    const result = await getCurrentPositionWithTimeout();

    expect(result).toEqual({ coords: { latitude: 1, longitude: 2 } });
  });

  it('rechaza tras el timeout si expo-location nunca resuelve ni rechaza', async () => {
    jest.useFakeTimers();
    mockGetCurrentPosition.mockReturnValue(new Promise(() => {}));

    const promise = getCurrentPositionWithTimeout();
    const assertion = expect(promise).rejects.toThrow('location-timeout');

    await jest.advanceTimersByTimeAsync(10_000);
    await assertion;
  });

  it('propaga el error real si expo-location rechaza antes del timeout', async () => {
    mockGetCurrentPosition.mockRejectedValue(new Error('permission-denied'));

    await expect(getCurrentPositionWithTimeout()).rejects.toThrow('permission-denied');
  });
});
