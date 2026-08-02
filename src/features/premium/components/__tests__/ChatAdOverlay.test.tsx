import { render } from '@testing-library/react-native';
// Los helpers `__mock*` no existen en la API real de expo-video — solo en
// este mock manual (`__mocks__/expo-video.tsx`, sustituido automáticamente
// por Jest para cualquier `import ... from 'expo-video'`, incluido el de
// `ChatAdOverlay.tsx`). Importados aquí por su ruta física real para que
// `tsc` los tipe contra el mock, no contra los tipos reales del paquete —
// en runtime, Jest resuelve ambos imports (este y el de `ChatAdOverlay.tsx`)
// al mismo módulo, así que `__mockVideoPlayers` sí refleja el player que
// crea el componente bajo prueba.
import {
  __mockVideoPlayers,
  __resetMockVideoPlayers,
  __emitPlayerEvent,
} from '../../../../../__mocks__/expo-video';
import { ChatAdOverlay } from '../ChatAdOverlay';

describe('ChatAdOverlay', () => {
  beforeEach(() => {
    __resetMockVideoPlayers();
  });

  it('no renderiza nada cuando visible es false', () => {
    const { queryByTestId } = render(
      <ChatAdOverlay visible={false} videoUrl="https://s3.example.com/ad.mp4" onFinish={jest.fn()} />,
    );

    expect(queryByTestId('chat-ad-overlay')).toBeNull();
  });

  it('se muestra de pantalla completa cuando visible es true, sin ningún botón de cerrar', () => {
    const { getByTestId, queryByText } = render(
      <ChatAdOverlay visible={true} videoUrl="https://s3.example.com/ad.mp4" onFinish={jest.fn()} />,
    );

    expect(getByTestId('chat-ad-overlay')).toBeTruthy();
    expect(queryByText(/cerrar/i)).toBeNull();
    expect(queryByText(/✕/)).toBeNull();
  });

  it('llama a onFinish cuando el video termina (evento playToEnd) — única forma de cerrarlo', () => {
    const onFinish = jest.fn();
    render(
      <ChatAdOverlay visible={true} videoUrl="https://s3.example.com/ad.mp4" onFinish={onFinish} />,
    );

    expect(__mockVideoPlayers).toHaveLength(1);
    __emitPlayerEvent(__mockVideoPlayers[0], 'playToEnd');

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('reproduce el video automáticamente al hacerse visible', () => {
    render(
      <ChatAdOverlay visible={true} videoUrl="https://s3.example.com/ad.mp4" onFinish={jest.fn()} />,
    );

    expect(__mockVideoPlayers[0].play).toHaveBeenCalled();
  });
});
