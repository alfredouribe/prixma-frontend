import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onboardingService } from '../services/onboardingService';
import { useStepIdentity } from '../hooks/useStepIdentity';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { ChipSelector } from '../components/ChipSelector';
import { DescribeInput } from '../components/DescribeInput';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { CatalogItem } from '../types/onboarding.types';

export function IdentityScreen() {
  const { form, handleSubmit, isLoading, error } = useStepIdentity();

  const [genderCatalog, setGenderCatalog] = useState<CatalogItem[]>([]);
  const [orientationCatalog, setOrientationCatalog] = useState<CatalogItem[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const { watch, setValue, register, formState: { errors } } = form;
  const displayName = watch('display_name') ?? '';
  const genderIds = watch('gender_identity_ids') ?? [];
  const orientationIds = watch('orientation_ids') ?? [];
  const customGender = watch('custom_gender_identity') ?? '';
  const customOrientation = watch('custom_orientation') ?? '';

  useEffect(() => {
    register('gender_identity_ids');
    register('orientation_ids');
  }, [register]);

  useEffect(() => {
    Promise.all([
      onboardingService.getCatalogs(),
      onboardingService.getStatus(),
    ]).then(([catalogs, status]) => {
      setGenderCatalog(catalogs.gender_identities);
      setOrientationCatalog(catalogs.orientations);
      if (status.profile) {
        form.reset({
          display_name: status.profile.display_name ?? '',
          gender_identity_ids: status.profile.gender_identities?.map((g) => g.id) ?? [],
          orientation_ids: status.profile.orientations?.map((o) => o.id) ?? [],
          custom_gender_identity: status.profile.custom_gender_identity ?? '',
          custom_orientation: status.profile.custom_orientation ?? '',
        });
      }
    }).catch(() => {}).finally(() => setIsLoadingCatalogs(false));
  }, []);

  function toggleGender(id: string) {
    const next = genderIds.includes(id)
      ? genderIds.filter((v) => v !== id)
      : [...genderIds, id];
    setValue('gender_identity_ids', next, { shouldValidate: true });
  }

  function toggleOrientation(id: string) {
    const next = orientationIds.includes(id)
      ? orientationIds.filter((v) => v !== id)
      : [...orientationIds, id];
    setValue('orientation_ids', next, { shouldValidate: true });
  }

  const canContinue =
    displayName.trim().length > 0 &&
    (genderIds.length > 0 || customGender.trim().length > 0) &&
    (orientationIds.length > 0 || customOrientation.trim().length > 0);

  if (isLoadingCatalogs) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OnboardingProgress currentStep={0} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>¿Cómo te llamas y cómo te identificas?</Text>
        <Text style={styles.subtitle}>Sin categorías fijas. Tú defines quién eres.</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tu nombre</Text>
          <TextInput
            value={displayName}
            onChangeText={(v) => setValue('display_name', v, { shouldValidate: true })}
            placeholder="ej. Kai"
            placeholderTextColor={text.tertiary}
            maxLength={50}
            style={styles.input}
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Identidad de género</Text>
          <ChipSelector
            items={genderCatalog}
            selected={genderIds}
            onToggle={toggleGender}
          />
          <DescribeInput
            label="Prefiero describirme como:"
            placeholder="Escribe tu identidad con tus propias palabras..."
            value={customGender}
            onChangeText={(v) => setValue('custom_gender_identity', v, { shouldValidate: true })}
          />
          {errors.gender_identity_ids && (
            <Text style={styles.errorText}>{errors.gender_identity_ids.message}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Orientación sexual</Text>
          <ChipSelector
            items={orientationCatalog}
            selected={orientationIds}
            onToggle={toggleOrientation}
          />
          <DescribeInput
            label="Prefiero describirme como:"
            placeholder="Escribe tu orientación con tus propias palabras..."
            value={customOrientation}
            onChangeText={(v) => setValue('custom_orientation', v, { shouldValidate: true })}
          />
          {errors.orientation_ids && (
            <Text style={styles.errorText}>{errors.orientation_ids.message}</Text>
          )}
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: text.secondary, marginBottom: spacing.xl },
  field: { marginBottom: spacing.xl },
  fieldLabel: { ...typography.label, color: text.secondary, marginBottom: spacing.sm },
  input: {
    ...typography.body,
    color: text.primary,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: text.secondary, marginBottom: spacing.md },
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
