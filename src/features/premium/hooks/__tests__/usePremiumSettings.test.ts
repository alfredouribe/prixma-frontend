import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePremiumSettings } from '../usePremiumSettings';
import { premiumService } from '../../services/premiumService';
import type { PremiumSettings } from '../../types/premium.types';

jest.mock('../../services/premiumService');

// `useFocusEffect` real solo dispara de nuevo con un NavigationContainer
// real detrás — se mockea para correr una vez al montar (mismo
// comportamiento ya usado sin mock en otros hooks de este proyecto, ej.
// useEvents.test.ts) y además se guarda una referencia al callback para
// que un test pueda invocarlo manualmente y simular un segundo foco (ej.
// el usuario vuelve a la tab de Perfil sin haberla desmontado).
let mockCapturedFocusCallback: (() => void | (() => void)) | null = null;

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useFocusEffect: (callback: () => void | (() => void)) => {
    mockCapturedFocusCallback = callback;
    // eslint-disable-next-line react-hooks/rules-of-hooks -- factory de jest.mock, no puede importar React arriba
    require('react').useEffect(() => {
      callback();
    }, []);
  },
}));

function buildSettings(overrides: Partial<PremiumSettings> = {}): PremiumSettings {
  return {
    is_premium: false,
    premium_until: null,
    free_swipes_per_ad: 5,
    free_likes_per_day: 5,
    free_chat_minutes_before_ad: 1,
    chat_ad_video_url: null,
    rewind_credits: 0,
    extra_super_likes: 0,
    ...overrides,
  };
}

describe('usePremiumSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedFocusCallback = null;
  });

  it('carga los ajustes de premium al enfocar la pantalla', async () => {
    (premiumService.getSettings as jest.Mock).mockResolvedValue(buildSettings());
    const { result } = renderHook(() => usePremiumSettings());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(premiumService.getSettings).toHaveBeenCalledTimes(1);
    expect(result.current.settings?.free_swipes_per_ad).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('deja settings en null y setea un error si falla la carga', async () => {
    (premiumService.getSettings as jest.Mock).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => usePremiumSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });

  it('vuelve a pedir los ajustes al re-enfocar, sin volver a mostrar isLoading', async () => {
    (premiumService.getSettings as jest.Mock)
      .mockResolvedValueOnce(buildSettings({ is_premium: false }))
      .mockResolvedValueOnce(buildSettings({ is_premium: true }));

    const { result } = renderHook(() => usePremiumSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.settings?.is_premium).toBe(false);

    // Simula que el usuario compró Prixma+ en otra pantalla y vuelve a
    // esta sin que se haya desmontado (mismo caso real del bug: tabs de
    // Expo Router nunca se desmontan al navegar entre ellas).
    await act(async () => {
      mockCapturedFocusCallback?.();
    });

    await waitFor(() => expect(result.current.settings?.is_premium).toBe(true));
    expect(premiumService.getSettings).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
  });

  it('un refetch fallido al re-enfocar no borra los settings ya cargados ni setea error', async () => {
    (premiumService.getSettings as jest.Mock)
      .mockResolvedValueOnce(buildSettings({ is_premium: true }))
      .mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => usePremiumSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      mockCapturedFocusCallback?.();
    });

    expect(premiumService.getSettings).toHaveBeenCalledTimes(2);
    expect(result.current.settings?.is_premium).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
