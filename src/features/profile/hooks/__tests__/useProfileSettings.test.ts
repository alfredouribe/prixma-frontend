import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfileSettings } from '../useProfileSettings';
import { profileService } from '../../services/profileService';
import type { ProfileSettings } from '../../types/profile.types';

jest.mock('../../services/profileService');

function buildSettings(overrides: Partial<ProfileSettings> = {}): ProfileSettings {
  return {
    id: 'settings-1',
    selfie_verification_enabled: true,
    incognito_mode_enabled: false,
    geo_block_enabled: false,
    reports_enabled: true,
    notify_matches_enabled: true,
    notify_messages_enabled: true,
    notify_events_enabled: true,
    ...overrides,
  };
}

describe('useProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga los settings al montar', async () => {
    (profileService.getSettings as jest.Mock).mockResolvedValue(buildSettings());

    const { result } = renderHook(() => useProfileSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toEqual(buildSettings());
    expect(result.current.error).toBeNull();
  });

  it('expone un error legible si la carga inicial falla', async () => {
    (profileService.getSettings as jest.Mock).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useProfileSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });

  it('actualiza el toggle optimistamente y llama a updateSettings con el nuevo valor', async () => {
    (profileService.getSettings as jest.Mock).mockResolvedValue(buildSettings());
    (profileService.updateSettings as jest.Mock).mockResolvedValue(
      buildSettings({ incognito_mode_enabled: true }),
    );

    const { result } = renderHook(() => useProfileSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggle('incognito_mode_enabled');
    });

    expect(profileService.updateSettings).toHaveBeenCalledWith({ incognito_mode_enabled: true });
    expect(result.current.settings?.incognito_mode_enabled).toBe(true);
  });

  it('revierte el toggle local y muestra el error si el PATCH falla', async () => {
    (profileService.getSettings as jest.Mock).mockResolvedValue(
      buildSettings({ incognito_mode_enabled: false }),
    );
    (profileService.updateSettings as jest.Mock).mockRejectedValue({
      response: { data: { message: 'No se pudo actualizar tu configuración.' } },
    });

    const { result } = renderHook(() => useProfileSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggle('incognito_mode_enabled');
    });

    expect(result.current.settings?.incognito_mode_enabled).toBe(false);
    expect(result.current.error).toBe('No se pudo actualizar tu configuración.');
  });

  it('actualiza optimistamente una preferencia de notificación', async () => {
    (profileService.getSettings as jest.Mock).mockResolvedValue(buildSettings());
    (profileService.updateSettings as jest.Mock).mockResolvedValue(
      buildSettings({ notify_messages_enabled: false }),
    );

    const { result } = renderHook(() => useProfileSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.toggle('notify_messages_enabled');
    });

    expect(profileService.updateSettings).toHaveBeenCalledWith({ notify_messages_enabled: false });
    expect(result.current.settings?.notify_messages_enabled).toBe(false);
  });
});
