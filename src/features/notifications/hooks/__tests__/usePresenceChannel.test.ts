import { renderHook } from '@testing-library/react-native';
import { usePresenceChannel } from '../usePresenceChannel';
import { getEcho } from '../../../../lib/echo';

// Factory explícito (no automock) — mismo criterio que
// `features/chat/hooks/__tests__/useConversation.test.ts`: un automock
// forzaría a Jest a cargar el módulo real de `lib/echo.ts`, que hace
// `import Pusher from 'pusher-js/react-native'` y arrastra su dependencia
// nativa de NetInfo, rota en el entorno de test.
jest.mock('../../../../lib/echo', () => ({
  getEcho: jest.fn(),
  disconnectEcho: jest.fn(),
}));

describe('usePresenceChannel', () => {
  const join = jest.fn();
  const leave = jest.fn();
  const echoMock = { join, leave };

  beforeEach(() => {
    jest.clearAllMocks();
    (getEcho as jest.Mock).mockReturnValue(echoMock);
  });

  it('se une al canal `online` cuando enabled es true', () => {
    renderHook(() => usePresenceChannel(true));

    expect(join).toHaveBeenCalledWith('online');
  });

  it('no se une a ningún canal cuando enabled es false', () => {
    renderHook(() => usePresenceChannel(false));

    expect(join).not.toHaveBeenCalled();
  });

  it('se desconecta del canal al desmontar', () => {
    const { unmount } = renderHook(() => usePresenceChannel(true));

    unmount();

    expect(leave).toHaveBeenCalledWith('online');
  });

  it('se une al canal cuando enabled pasa de false a true', () => {
    const { rerender } = renderHook(({ enabled }) => usePresenceChannel(enabled), {
      initialProps: { enabled: false },
    });

    expect(join).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(join).toHaveBeenCalledWith('online');
  });
});
