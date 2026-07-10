import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitVerification } from '../hooks/useSubmitVerification';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface UploadDocumentScreenProps {
  onSubmitted?: () => void;
}

export function UploadDocumentScreen({ onSubmitted }: UploadDocumentScreenProps) {
  const {
    documentUri,
    isSubmitting,
    error,
    handlePickDocument,
    handleSubmit,
  } = useSubmitVerification({ onSubmitted });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Verifica tu identidad</Text>
        <Text style={styles.subtitle}>
          Este paso nos protege a todes en comunidad. Tranquile, esto solo lo utilizaremos para
          verificar que eres une persona real.
        </Text>
        <Text style={styles.instructions}>
          Toma una foto clara de tu INE por ambos lados. Asegúrate de que se lea completo y sin
          reflejos.
        </Text>

        <TouchableOpacity
          style={[styles.uploadZone, documentUri && styles.uploadZoneFilled]}
          onPress={handlePickDocument}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Toca aquí para subir tu INE"
        >
          {documentUri ? (
            <Image source={{ uri: documentUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="card-outline" size={32} color={colors.purple} />
              <Text style={styles.uploadZoneTitle}>Toca aquí para subir tu INE</Text>
              <Text style={styles.uploadZoneSpecs}>JPG o PNG · máx. 10 MB</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.privacyNote}>
          Tu documento se usa únicamente para verificar tu identidad. No lo compartimos con nadie
          ni lo guardamos después de la revisión.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!documentUri || isSubmitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!documentUri || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonLabel}>Enviar para verificación</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h1, color: text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: text.secondary, marginBottom: spacing.lg },
  instructions: { ...typography.small, color: text.secondary, marginBottom: spacing.xl },
  uploadZone: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 180,
  },
  uploadZoneFilled: { borderStyle: 'solid', padding: 0 },
  uploadZoneTitle: { ...typography.body, fontFamily: 'PoppinsRounded-Medium', color: text.primary, textAlign: 'center' },
  uploadZoneSpecs: { ...typography.small, color: text.tertiary, textAlign: 'center' },
  preview: { width: '100%', height: 220, borderRadius: radius.lg },
  errorText: { ...typography.small, color: colors.rose, textAlign: 'center', marginTop: spacing.md },
  privacyNote: { ...typography.caption, color: text.tertiary, textAlign: 'center', marginTop: spacing.xl },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: surfaces.border,
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
});
