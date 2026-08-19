import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRewind } from '../useRewind';
import { matchingService } from '../../../matching/services/matchingService';

jest.mock('../../../matching/services/matchingService');

describe('useRewind', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('llama a matchingService.rewind y avisa al llamador con el índice a restaurar', async () => {
    (matchingService.rewind as jest.Mock).mockResolvedValue({
      swiped_id: 'profile-uuid',
      rewind_credits: 2,
    });

    const onRewind = jest.fn();
    const { result } = renderHook(() => useRewind({ initialCredits: 3, onRewind }));

    await act(async () => {
      await result.current.rewind(4);
    });

    expect(matchingService.rewind).toHaveBeenCalledTimes(1);
    expect(onRewind).toHaveBeenCalledWith(4);
    expect(result.current.rewindCredits).toBe(2);
    expect(result.current.error).toBeNull();
    expect(result.current.isRewinding).toBe(false);
  });

  it('en error, expone el mensaje del servidor y no llama a onRewind', async () => {
    (matchingService.rewind as jest.Mock).mockRejectedValue({
      response: { data: { message: 'No puedes deshacer un swipe que ya generó un match.' } },
    });

    const onRewind = jest.fn();
    const { result } = renderHook(() => useRewind({ initialCredits: 3, onRewind }));

    await act(async () => {
      await result.current.rewind(4);
    });

    expect(onRewind).not.toHaveBeenCalled();
    expect(result.current.error).toBe('No puedes deshacer un swipe que ya generó un match.');
    expect(result.current.rewindCredits).toBe(3);
  });

  it('usa un mensaje genérico si el error no trae `message`', async () => {
    (matchingService.rewind as jest.Mock).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useRewind({ initialCredits: 1, onRewind: jest.fn() }));

    await act(async () => {
      await result.current.rewind(0);
    });

    expect(result.current.error).toBe('No se pudo deshacer el swipe. Intenta de nuevo.');
  });

  it('sincroniza rewindCredits cuando initialCredits llega después (settings resuelve tarde)', async () => {
    const { result, rerender } = renderHook(
      ({ initialCredits }) => useRewind({ initialCredits, onRewind: jest.fn() }),
      { initialProps: { initialCredits: 0 } },
    );

    expect(result.current.rewindCredits).toBe(0);

    rerender({ initialCredits: 5 });

    await waitFor(() => expect(result.current.rewindCredits).toBe(5));
  });

  it('no pisa el saldo actualizado por el servidor si initialCredits no cambia', async () => {
    (matchingService.rewind as jest.Mock).mockResolvedValue({
      swiped_id: 'profile-uuid',
      rewind_credits: 2,
    });

    const { result, rerender } = renderHook(
      ({ initialCredits }) => useRewind({ initialCredits, onRewind: jest.fn() }),
      { initialProps: { initialCredits: 3 } },
    );

    await act(async () => {
      await result.current.rewind(0);
    });
    expect(result.current.rewindCredits).toBe(2);

    // Un re-render con el mismo `initialCredits` (ej. el padre re-renderiza
    // por otra razón) no debe resetear el saldo ya actualizado por el
    // servidor de vuelta al valor original de settings.
    rerender({ initialCredits: 3 });
    expect(result.current.rewindCredits).toBe(2);
  });

  it('resetea el error en cada nuevo intento', async () => {
    (matchingService.rewind as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { message: 'No hay nada que deshacer.' } } })
      .mockResolvedValueOnce({ swiped_id: 'profile-uuid', rewind_credits: 1 });

    const { result } = renderHook(() => useRewind({ initialCredits: 2, onRewind: jest.fn() }));

    await act(async () => {
      await result.current.rewind(0);
    });
    expect(result.current.error).toBe('No hay nada que deshacer.');

    await act(async () => {
      await result.current.rewind(1);
    });
    expect(result.current.error).toBeNull();
  });
});
