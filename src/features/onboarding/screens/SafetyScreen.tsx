import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStepSafety } from '../hooks/useStepSafety';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { SafetyToggle } from '../components/SafetyToggle';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

const TOGGLES = [
  {
    key: 'selfie_verification_enabled' as const,
    icon: '🤳',
    label: 'Verificación con selfie',
    description: 'Un badge visible en tu perfil',
  },
  {
    key: 'incognito_mode_enabled' as const,
    icon: '👁️',
    label: 'Modo incógnito',
    description: 'Solo ven tu perfil quienes tú apruebas',
  },
  {
    key: 'geo_block_enabled' as const,
    icon: '📍',
    label: 'Bloqueo geográfico',
    description: 'Oculta tu perfil en zonas específicas',
  },
  {
    key: 'reports_enabled' as const,
    icon: '🛡️',
    label: 'Reportes con consecuencias',
    description: 'Cuentas reportadas entran en revisión inmediata',
  },
];

export function SafetyScreen() {
  const router = useRouter();
  const { settings, toggle, handleSubmit, isLoading, error } = useStepSafety();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>← Atrás</Text>
      </TouchableOpacity>

      <OnboardingProgress currentStep={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Para nosotros lo más importante es tu seguridad</Text>
        <Text style={styles.subtitle}>
          Configura cómo y cuándo te ven. Puedes cambiarlo cuando quieras.
        </Text>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🚫 Política de tolerancia cero</Text>
          <Text style={styles.bannerText}>
            Prixma no tolera ningún tipo de discriminación, odio o acoso. Cualquier reporte es
            revisado por nuestro equipo y tiene consecuencias reales.
          </Text>
        </View>

        <View style={styles.toggleList}>
          {TOGGLES.map((t) => (
            <SafetyToggle
              key={t.key}
              icon={t.icon}
              label={t.label}
              description={t.description}
              value={settings[t.key]}
              onToggle={() => toggle(t.key)}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonLabel}>Entrar a Prixma</Text>
          )}
        </TouchableOpacity>
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
  subtitle: { ...typography.body, color: text.secondary, marginBottom: spacing.xl },
  banner: {
    backgroundColor: surfaces.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  bannerTitle: {
    ...typography.body,
    fontFamily: 'PoppinsRounded-SemiBold',
    color: text.primary,
  },
  bannerText: { ...typography.small, color: text.secondary, lineHeight: 20 },
  toggleList: { gap: spacing.md },
  errorText: { ...typography.small, color: colors.rose, marginTop: spacing.lg },
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
