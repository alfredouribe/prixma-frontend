import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { verificationService } from '../services/verificationService';
import { extractApiError } from '../../../lib/extractApiError';

type SubmitState = 'idle' | 'uploading' | 'submitting' | 'done' | 'error';

interface UseSubmitVerificationProps {
  onSubmitted?: () => void;
}

export function useSubmitVerification({ onSubmitted }: UseSubmitVerificationProps = {}) {
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitas permitir el acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setDocumentUri(result.assets[0].uri);
    setError(null);
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setDocumentUri(result.assets[0].uri);
    setError(null);
  }

  function handlePickDocument() {
    Alert.alert('Verifica tu identidad', '¿Desde dónde quieres subir tu INE?', [
      { text: 'Cámara', onPress: pickFromCamera },
      { text: 'Galería', onPress: pickFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleSubmit() {
    if (!documentUri) {
      setError('Selecciona una foto de tu INE antes de enviar.');
      return;
    }

    setState('uploading');
    setError(null);

    try {
      const compressed = await manipulateAsync(
        documentUri,
        [{ resize: { width: 1600 } }],
        { compress: 0.85, format: SaveFormat.JPEG },
      );

      setState('submitting');
      await verificationService.submit(compressed.uri);

      setState('done');
      onSubmitted?.();
    } catch (err) {
      setState('error');
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  return {
    documentUri,
    isSubmitting: state === 'uploading' || state === 'submitting',
    state,
    error,
    handlePickDocument,
    handleSubmit,
  };
}
