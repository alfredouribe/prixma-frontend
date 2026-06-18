import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { onboardingService } from '../services/onboardingService';
import { useStepIntention } from '../hooks/useStepIntention';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { IntentionCard } from '../components/IntentionCard';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { Intention } from '../types/onboarding.types';

export function IntentionScreen() {
  const router = useRouter();
  const { form, handleSubmit, isLoading, error } = useStepIntention();

  const { watch, setValue } = form;
  const intention = watch('intention') ?? null;

  useEffect(() => {
    onboardingService.getStatus().then((status) => {
      if (status.profile?.intention) {
        form.reset({ intention: status.profile.intention });
      }
    }).catch(() => {});
  }, []);

  function selectIntention(value: Intention) {
    setValue('intention', value, { shouldValidate: true });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>← Atrás</Text>
      </TouchableOpacity>

      <OnboardingProgress currentStep={2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>¿Qué estás buscando?</Text>
        <Text style={styles.subtitle}>
          Honestidad ante todo — filtramos por intención para que los matches tengan sentido.
        </Text>

        <IntentionCard selected={intention} onSelect={selectIntention} />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !intention && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!intention || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonLabel}>Siguiente</Text>
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
  subtitle: { ...typography.body, color: text.secondary, marginBottom: spacing.sm },
  errorText: { ...typography.small, color: colors.rose, marginTop: spacing.sm },
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
