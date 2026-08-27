import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { spacing, text, typography } from '../../../lib/theme';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese).
const LABEL = 'Publicidad';

interface ChatAdOverlayProps {
  visible: boolean;
  videoUrl: string;
  onFinish: () => void;
}

/**
 * Video de publicidad de pantalla completa, no evitable — ver
 * features/premium/specs/spec.md → "Video de publicidad en chat". A
 * propósito NO tiene ningún botón de cerrar: solo se oculta cuando el
 * player emite `playToEnd` ("es para que paguen si se puso interesante la
 * conversación", pedido explícito del humano). `onRequestClose` (botón
 * atrás de Android) es un no-op por la misma razón.
 */
export function ChatAdOverlay({ visible, videoUrl, onFinish }: ChatAdOverlayProps) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!visible) return;

    player.play();
    const subscription = player.addListener('playToEnd', onFinish);
    return () => subscription.remove();
  }, [visible, player, onFinish]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
      testID="chat-ad-overlay"
    >
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />
        <Text style={styles.label}>{LABEL}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
    width: '100%',
  },
  label: {
    position: 'absolute',
    top: spacing.xxl,
    alignSelf: 'center',
    ...typography.caption,
    color: text.secondary,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
});
