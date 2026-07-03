import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthGlow } from '../../auth/components/AuthGlow';
import { useStepVideo } from '../hooks/useStepVideo';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { VideoUploader } from '../components/VideoUploader';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

export function VideoScreen() {
  const router = useRouter();
  const { videoState, error, handleVideoSelected, handleSkip, handleContinue } = useStepVideo();

  const isBlocked = videoState === 'uploading' || videoState === 'processing';

  async function recordVideo() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) return;
    handleVideoSelected(asset.uri, asset.mimeType ?? undefined);
  }

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
    if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) return;
    handleVideoSelected(asset.uri, asset.mimeType ?? undefined);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AuthGlow />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={text.primary} />
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
          onRetry={recordVideo}
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
              style={[styles.button, isBlocked && styles.buttonDisabled]}
              onPress={recordVideo}
              disabled={isBlocked}
              activeOpacity={0.8}
            >
              <Ionicons name="videocam-outline" size={18} color={colors.white} style={styles.btnIcon} />
              <Text style={styles.buttonLabel}>Grabar ahora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, isBlocked && styles.buttonDisabled]}
              onPress={pickVideo}
              disabled={isBlocked}
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={18} color={colors.purple} style={styles.btnIcon} />
              <Text style={styles.buttonSecondaryLabel}>Subir desde galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipLink}
              onPress={handleSkip}
              disabled={isBlocked}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h1, color: text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: text.secondary },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: surfaces.border,
    gap: spacing.md,
  },
  btnIcon: {
    marginRight: spacing.xs,
  },
  button: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonLabel: { ...typography.button, color: colors.white },
  buttonSecondaryLabel: { ...typography.button, color: colors.purple },
  skipLink: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { ...typography.body, color: text.secondary },
});
