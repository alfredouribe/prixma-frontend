import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface VerificationTeaserScreenProps {
  onVerifyNow: () => void;
}

/**
 * Pantalla teaser que ve un perfil `unverified` ANTES de entrar al
 * formulario de subida (`UploadDocumentScreen`). Copy y layout tomados de
 * `design/profile/prixma_verificacion_identidad.html` → "Gate de Explorar"
 * y `brand/copies.md` → "Verificación de identidad" → "Gate de Explorar
 * (usuario no verificado)".
 */
export function VerificationTeaserScreen({ onVerifyNow }: VerificationTeaserScreenProps) {
  function handleWhyWeAskThis() {
    // No hay copy propio definido para este modal en brand/copies.md — se
    // reutiliza literal la nota de privacidad ya aprobada para "Subir
    // documento" en vez de inventar texto nuevo.
    Alert.alert(
      'Verifica tu identidad',
      'Tu documento se usa únicamente para verificar tu identidad. No lo compartimos con nadie ni lo guardamos después de la revisión.',
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.rose}33`, `${colors.purple}55`, `${colors.blue}22`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.photoGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(13,13,20,0.3)', surfaces.bg]}
        locations={[0, 0.65]}
        style={styles.overlayGradient}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.bottom}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.white} style={styles.lockIcon} />
          <Text style={styles.title}>Recuerda verificar tu identidad para iniciar la aventura</Text>
          <Text style={styles.subtitle}>Protégete y protege a la comunidad.</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onVerifyNow}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.buttonLabel}>Verificar ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWhyWeAskThis} activeOpacity={0.6} accessibilityRole="button">
            <Text style={styles.link}>¿Por qué pedimos esto?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  photoGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  overlayGradient: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1, justifyContent: 'flex-end' },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' },
  lockIcon: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: text.secondary, textAlign: 'center', marginBottom: spacing.xl },
  button: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonLabel: { ...typography.button, color: colors.white },
  link: { ...typography.small, color: text.tertiary },
});
