import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useStepVideo } from '../hooks/useStepVideo';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { VideoUploader } from '../components/VideoUploader';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

export function VideoScreen() {
  const router = useRouter();
  const { videoState, error, handleVideoSelected, handleSkip, handleContinue } = useStepVideo();

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      quality: 1,
      // TODO: PENDIENTE IMPORTANTE — descomentar para fix de HEVC Dolby Vision
      // Compatible fuerza a PHPickerViewController a transcodificar formatos
      // no estándar (HEVC Dolby Vision, ProRes, etc.) antes de devolver el URI.
      // Sin esto, iOS devuelve un archivo de 0 bytes para esos formatos.
      // preferredAssetRepresentationMode:
      //   ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
      return;
    }

    handleVideoSelected(asset.uri, asset.mimeType ?? undefined);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>← Atrás</Text>
      </TouchableOpacity>

      <OnboardingProgress currentStep={4} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>¿Liste? ¡Ahora sí!</Text>
        <Text style={styles.subtitle}>
          Luce y comparte lo orgullose que estás de ti. De 30 a 60 segundos nos ayuda a generar
          conexiones reales y darle propósito a tu búsqueda.
        </Text>

        <VideoUploader
          state={videoState}
          error={error}
          onPickFile={pickVideo}
        />
      </ScrollView>

      <View style={styles.footer}>
        {videoState === 'done' ? (
          <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.buttonLabel}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, (videoState === 'uploading' || videoState === 'processing') && styles.buttonDisabled]}
              onPress={pickVideo}
              disabled={videoState === 'uploading' || videoState === 'processing'}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonLabel}>Subir desde galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipLink}
              onPress={handleSkip}
              disabled={videoState === 'uploading' || videoState === 'processing'}
              activeOpacity={0.6}
            >
              <Text style={styles.skipText}>Lo hago después</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  backText: { ...typography.body, color: text.secondary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: text.secondary },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: surfaces.border,
    gap: spacing.md,
  },
  button: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonLabel: { ...typography.button, color: colors.white },
  skipLink: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { ...typography.body, color: text.secondary },
});
