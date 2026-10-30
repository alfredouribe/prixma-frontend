import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import * as Sentry from '@sentry/react-native';
import { useSubmitVerification } from '../useSubmitVerification';
import { verificationService } from '../../services/verificationService';

jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');
jest.mock('../../services/verificationService');
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

const PICKED_ASSET = { canceled: false, assets: [{ uri: 'file://ine.jpg' }] };

async function pickDocumentFromCamera(handlePickDocument: () => void) {
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
    // El primer botón definido en el hook es "Cámara"
    buttons?.[0]?.onPress?.();
  });
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue(PICKED_ASSET);

  await act(async () => {
    handlePickDocument();
  });
}

async function pickDocumentFromLibrary(handlePickDocument: () => void) {
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
    // El segundo botón definido en el hook es "Galería"
    buttons?.[1]?.onPress?.();
  });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(PICKED_ASSET);

  await act(async () => {
    handlePickDocument();
  });
}

describe('useSubmitVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (manipulateAsync as jest.Mock).mockResolvedValue({ uri: 'file://ine-compressed.jpg' });
    (verificationService.submit as jest.Mock).mockResolvedValue({
      id: 'req-1',
      status: 'pending',
      rejection_reason: null,
      reviewed_at: null,
      created_at: '2026-07-09T00:00:00Z',
    });
  });

  it('envía el documento comprimido directo al backend tras seleccionar una foto', async () => {
    const onSubmitted = jest.fn();
    const { result } = renderHook(() => useSubmitVerification({ onSubmitted }));

    await pickDocumentFromLibrary(result.current.handlePickDocument);
    await waitFor(() => expect(result.current.documentUri).toBe('file://ine.jpg'));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(verificationService.submit).toHaveBeenCalledWith('file://ine-compressed.jpg');
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('done');
    expect(result.current.error).toBeNull();
  });

  it('no envía si no se ha seleccionado ningún documento', async () => {
    const { result } = renderHook(() => useSubmitVerification());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(verificationService.submit).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Selecciona una foto de tu INE antes de enviar.');
  });

  it('expone un error legible cuando falla el envío al backend', async () => {
    (verificationService.submit as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Ya tienes una solicitud de verificación en revisión.' } },
    });
    const onSubmitted = jest.fn();
    const { result } = renderHook(() => useSubmitVerification({ onSubmitted }));

    await pickDocumentFromLibrary(result.current.handlePickDocument);
    await waitFor(() => expect(result.current.documentUri).toBe('file://ine.jpg'));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Ya tienes una solicitud de verificación en revisión.');
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it('reporta el error a Sentry con la fuente "camera" cuando falla el envío tras tomar una foto con la cámara', async () => {
    const uploadError = new Error('Network request failed');
    (verificationService.submit as jest.Mock).mockRejectedValue(uploadError);
    const { result } = renderHook(() => useSubmitVerification());

    await pickDocumentFromCamera(result.current.handlePickDocument);
    await waitFor(() => expect(result.current.documentUri).toBe('file://ine.jpg'));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      uploadError,
      { tags: { feature: 'verification_submit', pick_source: 'camera' } },
    );
    expect(result.current.error).toBe(
      'No pudimos procesar la foto de tu documento. Intenta tomarla de nuevo o selecciona una desde tu galería.',
    );
  });

  it('reporta el error a Sentry con la fuente "library" cuando falla el envío tras elegir una foto de la galería', async () => {
    const uploadError = new Error('Network request failed');
    (verificationService.submit as jest.Mock).mockRejectedValue(uploadError);
    const { result } = renderHook(() => useSubmitVerification());

    await pickDocumentFromLibrary(result.current.handlePickDocument);
    await waitFor(() => expect(result.current.documentUri).toBe('file://ine.jpg'));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      uploadError,
      { tags: { feature: 'verification_submit', pick_source: 'library' } },
    );
    expect(result.current.error).toBe('Algo salió mal. Revisa tu conexión e intenta de nuevo.');
  });
});
