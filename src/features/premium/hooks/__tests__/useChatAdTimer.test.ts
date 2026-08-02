import { renderHook, act } from '@testing-library/react-native';
import { useChatAdTimer } from '../useChatAdTimer';

describe('useChatAdTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dispara showAd a los N minutos exactos cuando está habilitado', () => {
    const { result } = renderHook(() => useChatAdTimer({ enabled: true, minutes: 1 }));

    expect(result.current.showAd).toBe(false);

    act(() => {
      jest.advanceTimersByTime(59_999);
    });
    expect(result.current.showAd).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.showAd).toBe(true);
  });

  it('no dispara si enabled es false (usuario premium o sin video configurado)', () => {
    const { result } = renderHook(() => useChatAdTimer({ enabled: false, minutes: 1 }));

    act(() => {
      jest.advanceTimersByTime(5 * 60_000);
    });

    expect(result.current.showAd).toBe(false);
  });

  it('respeta el número de minutos configurado (no hardcodeado)', () => {
    const { result } = renderHook(() => useChatAdTimer({ enabled: true, minutes: 3 }));

    act(() => {
      jest.advanceTimersByTime(2 * 60_000);
    });
    expect(result.current.showAd).toBe(false);

    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.showAd).toBe(true);
  });

  it('dismiss oculta el overlay', () => {
    const { result } = renderHook(() => useChatAdTimer({ enabled: true, minutes: 1 }));

    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.showAd).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.showAd).toBe(false);
  });

  it('se dispara una sola vez (no se repite pasado el intervalo)', () => {
    const { result } = renderHook(() => useChatAdTimer({ enabled: true, minutes: 1 }));

    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.showAd).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    act(() => {
      jest.advanceTimersByTime(5 * 60_000);
    });
    expect(result.current.showAd).toBe(false);
  });
});
