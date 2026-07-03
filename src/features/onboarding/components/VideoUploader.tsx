import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

type VideoState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface VideoUploaderProps {
  state: VideoState;
  error: string | null;
  onRetry: () => void;
}

export function VideoUploader({ state, error, onRetry }: VideoUploaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.zone, state === 'error' && styles.zoneError]}
        onPress={state === 'error' ? onRetry : undefined}
        activeOpacity={state === 'error' ? 0.7 : 1}
        disabled={state === 'uploading' || state === 'processing'}
      >
        {state === 'idle' && (
          <>
            <Text style={styles.zoneIcon}>🎥</Text>
            <Text style={styles.zoneTitle}>Graba o sube tu video de presentación</Text>
            <Text style={styles.zoneSpecs}>Cualquier formato · máx. 60 seg · 200 MB</Text>
          </>
        )}

        {state === 'uploading' && (
          <>
            <ActivityIndicator color={colors.purple} size="large" />
            <Text style={styles.zoneTitle}>Subiendo video...</Text>
          </>
        )}

        {state === 'processing' && (
          <>
            <ActivityIndicator color={colors.purple} size="large" />
            <Text style={styles.zoneTitle}>Tu video se está procesando...</Text>
            <Text style={styles.zoneSpecs}>Esto puede tardar un momento, sorry por la espera 💜</Text>
          </>
        )}

        {state === 'done' && (
          <>
            <Text style={styles.zoneIcon}>✅</Text>
            <Text style={[styles.zoneTitle, { color: colors.green }]}>Video listo</Text>
          </>
        )}

        {state === 'error' && (
          <>
            <Text style={styles.zoneIcon}>⚠️</Text>
            <Text style={[styles.zoneTitle, { color: colors.rose }]}>
              {error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}
            </Text>
            <Text style={styles.zoneSpecs}>Toca para reintentar</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>Tranquile, solo tus matches lo ven</Text>
        <Text style={styles.privacyText}>
          No publicaremos tu video hasta que decidas hacer match
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  zone: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderStyle: 'dashed',
    borderRadius: radius.card,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  zoneError: {
    borderColor: colors.rose,
  },
  zoneIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  zoneTitle: {
    ...typography.body,
    fontFamily: 'PoppinsRounded-Medium',
    color: text.primary,
    textAlign: 'center',
  },
  zoneSpecs: {
    ...typography.small,
    color: text.tertiary,
    textAlign: 'center',
  },
  privacyNote: {
    marginTop: spacing.xl,
    backgroundColor: surfaces.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  privacyTitle: {
    ...typography.small,
    fontFamily: 'PoppinsRounded-SemiBold',
    color: text.primary,
  },
  privacyText: {
    ...typography.small,
    color: text.secondary,
  },
});
