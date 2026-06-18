import { useState } from 'react';
import { useRouter } from 'expo-router';
import { onboardingService } from '../services/onboardingService';
import { extractApiError } from '../../../lib/extractApiError';

type VideoState = 'idle' | 'uploading' | 'done' | 'error';

export function useStepVideo() {
  const router = useRouter();
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleVideoSelected(file: Blob) {
    setVideoState('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      const { upload_url, video_key } = await onboardingService.getVideoPresignedUrl();

      setUploadProgress(30);
      await onboardingService.uploadVideoToS3(upload_url, file);

      setUploadProgress(80);
      await onboardingService.saveVideo(video_key);

      setUploadProgress(100);
      setVideoState('done');
    } catch (err) {
      setVideoState('error');
      setError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  function handleSkip() {
    router.push('/(onboarding)/safety');
  }

  function handleContinue() {
    router.push('/(onboarding)/safety');
  }

  return { videoState, uploadProgress, error, handleVideoSelected, handleSkip, handleContinue };
}
