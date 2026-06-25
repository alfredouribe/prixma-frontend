import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMatchingPreferences } from '../useMatchingPreferences';
import { matchingService } from '../../services/matchingService';
import type { MatchingPreferences } from '../../types/matching.types';

jest.mock('../../services/matchingService');

const defaultPrefs: MatchingPreferences = {
  id: 'pref-uuid',
  age_min: 18,
  age_max: 55,
  max_distance_km: 50,
  intentions: null,
  gender_identities: null,
  orientations: null,
  verified_only: false,
  has_video_only: false,
};

describe('useMatchingPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga las preferencias al montar', async () => {
    (matchingService.getPreferences as jest.Mock).mockResolvedValue(defaultPrefs);

    const { result } = renderHook(() => useMatchingPreferences());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.preferences).toEqual(defaultPrefs);
  });

  it('actualiza preferencias y guarda el resultado del servidor', async () => {
    const updatedPrefs = { ...defaultPrefs, age_min: 22, verified_only: true };

    (matchingService.getPreferences as jest.Mock).mockResolvedValue(defaultPrefs);
    (matchingService.updatePreferences as jest.Mock).mockResolvedValue(updatedPrefs);

    const { result } = renderHook(() => useMatchingPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updatePreferences({ age_min: 22, verified_only: true });
    });

    expect(result.current.preferences?.age_min).toBe(22);
    expect(result.current.preferences?.verified_only).toBe(true);
  });

  it('los filtros guardados se cargan correctamente al abrir el hook', async () => {
    const savedPrefs = { ...defaultPrefs, intentions: ['partner', 'friendship'] as const };
    (matchingService.getPreferences as jest.Mock).mockResolvedValue(savedPrefs);

    const { result } = renderHook(() => useMatchingPreferences());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.preferences?.intentions).toEqual(['partner', 'friendship']);
  });
});
