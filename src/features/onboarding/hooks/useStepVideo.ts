import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { onboardingService } from '../services/onboardingService';
import { extractApiError } from '../../../lib/extractApiError';

type VideoState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const POLL_INTERVAL_MS = 3000;

export function useStepVideo() {
  const router = useRouter();
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  function startPolling() {
    pollRef.current = setInterval(async () => {
      try {
        const status = await onboardingService.getStatus();
        if (status.profile?.video_processed) {
          stopPolling();
          setVideoState('done');
        }
      } catch {
        // silencioso — el backend puede tardar en responder, seguimos intentando
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleVideoSelected(uri: string, mimeType?: string) {
    setVideoState('uploading');
    setError(null);

    try {
      await onboardingService.uploadVideo(uri, mimeType);
      setVideoState('processing');
      startPolling();
    } catch (err) {
      setVideoState('error');
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  function handleSkip() {
    stopPolling();
    router.push('/(onboarding)/safety');
  }

  function handleContinue() {
    router.push('/(onboarding)/safety');
  }

  return { videoState, error, handleVideoSelected, handleSkip, handleContinue };
}
