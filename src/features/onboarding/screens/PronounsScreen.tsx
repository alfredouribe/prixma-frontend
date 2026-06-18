import { useEffect, useState } from 'react';
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
import { useStepPronouns } from '../hooks/useStepPronouns';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { ChipSelector } from '../components/ChipSelector';
import { DescribeInput } from '../components/DescribeInput';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { CatalogItem } from '../types/onboarding.types';

export function PronounsScreen() {
  const router = useRouter();
  const { form, handleSubmit, isLoading, error } = useStepPronouns();
  const [pronounCatalog, setPronounCatalog] = useState<CatalogItem[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const { watch, setValue, register, formState: { errors } } = form;
  const pronounIds = watch('pronoun_ids') ?? [];
  const customPronouns = watch('custom_pronouns') ?? '';

  useEffect(() => {
    register('pronoun_ids');
  }, [register]);

  useEffect(() => {
    Promise.all([
      onboardingService.getCatalogs(),
      onboardingService.getStatus(),
    ])
      .then(([catalogs, status]) => {
        setPronounCatalog(catalogs.pronouns);
        if (status.profile) {
          form.reset({
            pronoun_ids: status.profile.pronouns?.map((p) => p.id) ?? [],
            custom_pronouns: status.profile.custom_pronouns ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCatalogs(false));
  }, []);

  function togglePronoun(id: string) {
    const next = pronounIds.includes(id)
      ? pronounIds.filter((v) => v !== id)
      : [...pronounIds, id];
    setValue('pronoun_ids', next, { shouldValidate: true });
  }

  const canContinue = pronounIds.length > 0 || customPronouns.trim().length > 0;

  if (isLoadingCatalogs) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>← Atrás</Text>
      </TouchableOpacity>

      <OnboardingProgress currentStep={1} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>¿Cuáles son tus pronombres?</Text>
        <Text style={styles.subtitle}>Aparecen en tu perfil. Puedes elegir más de uno.</Text>

        <ChipSelector
          items={pronounCatalog}
          selected={pronounIds}
          onToggle={togglePronoun}
        />

        <DescribeInput
          label="Prefiero describirlos como:"
          placeholder="ej. elli / ellu, xe / xem..."
          value={customPronouns}
          onChangeText={(v) => setValue('custom_pronouns', v, { shouldValidate: true })}
        />

        {errors.pronoun_ids && (
          <Text style={styles.errorText}>{errors.pronoun_ids.message}</Text>
        )}

        <View style={styles.verificationNote}>
          <Text style={styles.noteText}>
            Para verificar tu perfil necesitaremos una foto reciente (no mayor a 5 años). Esto ayuda a mantener la comunidad segura.
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canContinue || isLoading}
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
  centered: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  backText: { ...typography.body, color: text.secondary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: text.secondary, marginBottom: spacing.xl },
  errorText: { ...typography.small, color: colors.rose, marginTop: spacing.sm },
  verificationNote: {
    marginTop: spacing.xl,
    backgroundColor: surfaces.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noteText: { ...typography.small, color: text.secondary, lineHeight: 20 },
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
