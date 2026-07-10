import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyProfile } from '../../profile/hooks/useMyProfile';
import { ExploreScreen } from '../../matching/screens/ExploreScreen';
import { VerificationTeaserScreen } from './VerificationTeaserScreen';
import { UploadDocumentScreen } from './UploadDocumentScreen';
import { VerificationStatusScreen } from './VerificationStatusScreen';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

/**
 * Gate duro de navegación: mientras `profile.verification_status !== 'verified'`
 * el usuario nunca ve la cola de Explorar, sin importar cómo llegue a esta
 * ruta. Ver features/verification/specs/spec.md — "Gate de acceso".
 *
 * Flujo para `unverified`: primero el teaser (`VerificationTeaserScreen`,
 * "Gate de Explorar" en el diseño), y solo al tocar "Verificar ahora" se
 * entra al formulario (`UploadDocumentScreen`). El mismo toggle
 * (`showUploadForm`) también lo usa "¿Lo intentamos de nuevo?" en
 * `VerificationStatusScreen` para un perfil `rejected` — es estado de UI
 * (qué pantalla se muestra), no estado de negocio; mismo criterio que
 * `filtersVisible` en `ExploreScreen.tsx`.
 */
export function VerificationGateScreen() {
  const { profile, isLoading, error, reload } = useMyProfile();
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}</Text>
        <TouchableOpacity style={styles.button} onPress={reload} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (profile.verification_status === 'verified') {
    return <ExploreScreen />;
  }

  if (showUploadForm) {
    return (
      <UploadDocumentScreen
        onSubmitted={() => {
          setShowUploadForm(false);
          reload();
        }}
      />
    );
  }

  if (profile.verification_status === 'unverified') {
    return <VerificationTeaserScreen onVerifyNow={() => setShowUploadForm(true)} />;
  }

  return (
    <VerificationStatusScreen
      onRetry={() => setShowUploadForm(true)}
      onGoToExplore={reload}
    />
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
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  buttonLabel: { ...typography.button, color: colors.white },
});
