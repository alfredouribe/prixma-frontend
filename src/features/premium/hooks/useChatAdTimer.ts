import { useEffect, useState } from 'react';

interface UseChatAdTimerOptions {
  // `false` cuando el usuario es premium o no hay `chat_ad_video_url`
  // configurado — ver features/premium/specs/spec.md → "Video de
  // publicidad en chat".
  enabled: boolean;
  minutes: number;
}

/**
 * Cronómetro simple desde que el llamador (`ConversationScreen`) monta:
 * dispara `showAd = true` una sola vez a los `minutes` minutos, sin
 * repetirse. No persiste entre aperturas — si `enabled` es `false` desde el
 * inicio (premium o sin video configurado), el timer nunca arranca.
 */
export function useChatAdTimer({ enabled, minutes }: UseChatAdTimerOptions) {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => setShowAd(true), minutes * 60_000);
    return () => clearTimeout(timer);
  }, [enabled, minutes]);

  function dismiss() {
    setShowAd(false);
  }

  return { showAd, dismiss };
}
