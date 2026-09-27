import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMyProfile } from '../../profile/hooks/useMyProfile';
import { VerificationTeaserScreen } from './VerificationTeaserScreen';
import { UploadDocumentScreen } from './UploadDocumentScreen';
import { VerificationStatusScreen } from './VerificationStatusScreen';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

/**
 * Entrada a la feature de verificación desde Configuración del perfil
 * (`ProfileSettingsMenu` → "Verificación"). A diferencia de `VerificationGateScreen`
 * (gate duro del tab Explorar, que salta directo a `ExploreScreen` cuando ya
 * está verificado), aquí un perfil `verified` ve la pantalla de confirmación
 * con el botón "Ir a explorar".
 */
export function VerificationSettingsScreen() {
  const router = useRouter();
  const { profile, isLoading, error, reload } = useMyProfile();
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <BackButton onBack={() => router.back()} />
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <BackButton onBack={() => router.back()} />
        <Text style={styles.errorText}>{error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}</Text>
        <TouchableOpacity style={styles.button} onPress={reload} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showUploadForm) {
    return (
      <UploadDocumentScreen
        onBack={() => router.back()}
        onSubmitted={() => {
          setShowUploadForm(false);
          reload();
        }}
      />
    );
  }

  if (profile.verification_status === 'unverified') {
    return <VerificationTeaserScreen onVerifyNow={() => setShowUploadForm(true)} onBack={() => router.back()} />;
  }

  return (
    <VerificationStatusScreen
      onRetry={() => setShowUploadForm(true)}
      onGoToExplore={() => router.push('/explore')}
      onBack={() => router.back()}
    />
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      onPress={onBack}
      style={[styles.backButton, { top: insets.top + spacing.md }]}
      activeOpacity={0.7}
      accessibilityLabel="Volver"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={20} color={text.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  backButton: {
    // `top` real se calcula en runtime con `insets.top` — ver la nota
    // completa en VerificationTeaserScreen.tsx (bug real 2026-09-27).
    position: 'absolute',
    left: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  buttonLabel: { ...typography.button, color: colors.white },
});
