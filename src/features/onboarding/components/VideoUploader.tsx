import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

type VideoState = 'idle' | 'uploading' | 'done' | 'error';

interface VideoUploaderProps {
  state: VideoState;
  progress: number;
  error: string | null;
  onPickFile: () => void;
}

export function VideoUploader({ state, progress, error, onPickFile }: VideoUploaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.zone, state === 'error' && styles.zoneError]}
        onPress={state === 'idle' || state === 'error' ? onPickFile : undefined}
        activeOpacity={0.7}
        disabled={state === 'uploading'}
      >
        {state === 'idle' && (
          <>
            <Text style={styles.zoneIcon}>🎥</Text>
            <Text style={styles.zoneTitle}>Graba o sube tu video de presentación</Text>
            <Text style={styles.zoneSpecs}>MP4 / MOV · máx. 60 seg · 200 MB</Text>
          </>
        )}

        {state === 'uploading' && (
          <>
            <ActivityIndicator color={colors.purple} size="large" />
            <Text style={styles.zoneTitle}>Subiendo video...</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{progress}%</Text>
          </>
        )}

        {state === 'done' && (
          <>
            <Text style={styles.zoneIcon}>✅</Text>
            <Text style={[styles.zoneTitle, { color: colors.green }]}>Video subido</Text>
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
  progressTrack: {
    height: 6,
    width: '80%',
    borderRadius: radius.full,
    backgroundColor: surfaces.elevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: radius.full,
  },
  progressLabel: {
    ...typography.caption,
    color: text.secondary,
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
