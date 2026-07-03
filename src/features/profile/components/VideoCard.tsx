import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { File, Paths } from 'expo-file-system';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function getCacheFile(url: string): File {
  try {
    const { pathname } = new URL(url);
    const filename = pathname.split('/').pop()?.split('?')[0] ?? 'video.mp4';
    return new File(Paths.cache, `prixma_${filename}`);
  } catch {
    return new File(Paths.cache, 'prixma_video.mp4');
  }
}

interface VideoCardProps {
  videoUrl: string;
  label: string;
}

export function VideoCard({ videoUrl, label }: VideoCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  async function handleOpen() {
    setModalVisible(true);
    setLoadState('loading');

    try {
      const cacheFile = getCacheFile(videoUrl);
      if (!cacheFile.exists) {
        await File.downloadFileAsync(videoUrl, cacheFile);
      }

      player.replace({ uri: cacheFile.uri });
      player.play();
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }

  function handleClose() {
    player.pause();
    setModalVisible(false);
    setLoadState('idle');
  }

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleOpen} activeOpacity={0.8}>
        <View style={styles.thumb}>
          <Text style={styles.thumbIcon}>▶</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel} numberOfLines={1}>{label}</Text>
          <Text style={styles.cardSubtitle}>Solo tus matches lo ven</Text>
        </View>
        <View style={styles.playBtn}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.closeBtnText}>✕  Cerrar</Text>
          </TouchableOpacity>

          <View style={styles.playerArea}>
            {loadState === 'loading' && (
              <View style={styles.centered}>
                <ActivityIndicator color={colors.purple} size="large" />
              </View>
            )}

            {loadState === 'error' && (
              <View style={styles.centered}>
                <Text style={styles.errorText}>No se pudo cargar el video.</Text>
                <TouchableOpacity onPress={handleOpen} style={styles.retryBtn} activeOpacity={0.8}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )}

            {loadState === 'ready' && (
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbIcon: {
    fontSize: 18,
    color: colors.white,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    ...typography.small,
    color: text.primary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.purple,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: colors.white, fontSize: 13, marginLeft: 2 },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
  },
  closeBtnText: {
    color: colors.white,
    ...typography.label,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  playerArea: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  centered: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  retryText: { ...typography.button, color: colors.white },
});
