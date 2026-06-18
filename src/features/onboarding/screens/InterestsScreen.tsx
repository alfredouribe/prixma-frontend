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
import { useStepInterests } from '../hooks/useStepInterests';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { InterestCategory } from '../components/InterestCategory';
import { TagInput } from '../components/TagInput';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { Interest, InterestCategory as Category } from '../types/onboarding.types';

const CATEGORY_ORDER: Category[] = ['culture_art', 'activism_community', 'lifestyle', 'tech_science'];

export function InterestsScreen() {
  const router = useRouter();
  const { form, handleSubmit, isLoading, error } = useStepInterests();
  const [catalog, setCatalog] = useState<Record<Category, Interest[]>>({} as Record<Category, Interest[]>);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const { watch, setValue, register, formState: { errors } } = form;
  const interestIds = watch('interest_ids') ?? [];
  // Estado local para evitar el ciclo de render de watch() con setValue
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    register('interest_ids');
    register('custom_interests');
  }, [register]);

  useEffect(() => {
    Promise.all([
      onboardingService.getCatalogs(),
      onboardingService.getStatus(),
    ])
      .then(([catalogs, status]) => {
        setCatalog(catalogs.interests);
        if (status.profile) {
          const savedCustom = status.profile.custom_interests
            ? status.profile.custom_interests.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
            : [];
          setCustomTags(savedCustom);
          form.reset({
            interest_ids: status.profile.interests?.map((i) => i.id) ?? [],
            custom_interests: savedCustom,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCatalogs(false));
  }, []);

  function toggleInterest(id: string) {
    const next = interestIds.includes(id)
      ? interestIds.filter((v) => v !== id)
      : [...interestIds, id];
    setValue('interest_ids', next, { shouldValidate: true });
  }

  function handleTagsChange(tags: string[]) {
    setCustomTags(tags);
    setValue('custom_interests', tags as never);
    form.trigger('interest_ids');
  }

  const totalSelected = interestIds.length + customTags.length;
  const canContinue = totalSelected >= 3;

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

      <OnboardingProgress currentStep={3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>¡Cuéntales más!</Text>
        <Text style={styles.subtitle}>
          Elige lo que resuena contigo. No hay respuestas incorrectas.
        </Text>
        <Text style={styles.counter}>
          {totalSelected}/3 mínimo{totalSelected >= 3 ? ' ✓' : ''}
        </Text>

        {CATEGORY_ORDER.map((cat) => (
          <InterestCategory
            key={cat}
            category={cat}
            items={catalog[cat] ?? []}
            selected={interestIds}
            onToggle={toggleInterest}
          />
        ))}

        <TagInput
          label="¿Algo más que quieras compartir?"
          placeholder="ej. cosplay, astronomía, drag..."
          tags={customTags}
          onTagsChange={handleTagsChange}
        />

        {!canContinue && errors.interest_ids && (
          <Text style={styles.errorText}>{errors.interest_ids.message}</Text>
        )}
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
  subtitle: { ...typography.body, color: text.secondary },
  counter: { ...typography.small, color: text.tertiary, marginTop: spacing.sm },
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
