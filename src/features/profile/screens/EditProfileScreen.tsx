import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEditProfile } from '../hooks/useEditProfile';
import { PhotoGallery } from '../components/PhotoGallery';
import { ChipSelector } from '../../onboarding/components/ChipSelector';
import { DescribeInput } from '../../onboarding/components/DescribeInput';
import { TagInput } from '../../onboarding/components/TagInput';
import { onboardingService } from '../../onboarding/services/onboardingService';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { MyProfile } from '../types/profile.types';
import type { CatalogItem, Interest } from '../../onboarding/types/onboarding.types';

interface EditProfileScreenProps {
  profile: MyProfile;
}

const INTENTIONS = [
  { value: 'partner', label: 'Una pareja', description: 'Relación romántica o afectiva' },
  { value: 'friendship', label: 'Amistades LGBTQ+', description: 'Personas con quien conectar' },
  { value: 'community', label: 'Comunidad y activismo', description: 'Eventos, causas, espacios seguros' },
  { value: 'mentorship', label: 'Mentoría', description: 'Guía de alguien con más experiencia' },
] as const;

export function EditProfileScreen({ profile }: EditProfileScreenProps) {
  const router = useRouter();
  const {
    form,
    handleSave,
    isSaving,
    saveError,
    photos,
    isUploadingPhoto,
    photoError,
    handlePickPhoto,
    handleDeletePhoto,
    // TODO: PENDIENTE IMPORTANTE — video deshabilitado temporalmente, descomentar JSX abajo al reactivar
    videoUrl,
    videoState,
    uploadProgress,
    videoError,
    handlePickVideo,
    handleDeleteVideo,
  } = useEditProfile(profile);

  function confirmDeleteVideo() {
    Alert.alert('Eliminar video', '¿Eliminar tu video de presentación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: handleDeleteVideo },
    ]);
  }

  const [genderCatalog, setGenderCatalog] = useState<CatalogItem[]>([]);
  const [orientationCatalog, setOrientationCatalog] = useState<CatalogItem[]>([]);
  const [pronounCatalog, setPronounCatalog] = useState<CatalogItem[]>([]);
  const [interestCatalog, setInterestCatalog] = useState<Interest[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const { register, watch, setValue, formState: { errors } } = form;

  const bio = watch('bio') ?? '';
  const displayName = watch('display_name') ?? '';
  const genderIds = watch('gender_identity_ids') ?? [];
  const orientationIds = watch('orientation_ids') ?? [];
  const pronounIds = watch('pronoun_ids') ?? [];
  const interestIds = watch('interest_ids') ?? [];
  const intention = watch('intention');
  const customGender = watch('custom_gender_identity') ?? '';
  const customOrientation = watch('custom_orientation') ?? '';
  const customPronouns = watch('custom_pronouns') ?? '';

  const [customInterestTags, setCustomInterestTags] = useState<string[]>(
    () => (profile.custom_interests ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  );

  function handleCustomInterestTagsChange(tags: string[]) {
    setCustomInterestTags(tags);
    setValue('custom_interests', tags.join(',') || null, { shouldValidate: true });
  }

  useEffect(() => {
    register('bio');
    register('display_name');
    register('city');
    register('gender_identity_ids');
    register('orientation_ids');
    register('pronoun_ids');
    register('interest_ids');
    register('intention');
  }, [register]);

  useEffect(() => {
    onboardingService.getCatalogs()
      .then((catalogs) => {
        setGenderCatalog(catalogs.gender_identities);
        setOrientationCatalog(catalogs.orientations);
        setPronounCatalog(catalogs.pronouns);
        const allInterests: Interest[] = Object.values(catalogs.interests).flat();
        setInterestCatalog(allInterests);
      })
      .catch(() => {})
      .finally(() => setIsLoadingCatalogs(false));
  }, []);

  function toggle(field: 'gender_identity_ids' | 'orientation_ids' | 'pronoun_ids' | 'interest_ids', id: string) {
    const current = (form.getValues(field) ?? []) as string[];
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    setValue(field, next, { shouldValidate: true });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.cancelText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar perfil</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          style={styles.saveBtn}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nombre */}
        <Field label="Nombre">
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={(v) => setValue('display_name', v, { shouldValidate: true })}
            placeholderTextColor={text.tertiary}
            maxLength={50}
          />
          {errors.display_name && (
            <Text style={styles.fieldError}>{errors.display_name.message}</Text>
          )}
        </Field>

        {/* Ciudad */}
        <Field label="Ciudad">
          <TextInput
            style={styles.input}
            value={watch('city') ?? ''}
            onChangeText={(v) => setValue('city', v || null, { shouldValidate: true })}
            placeholderTextColor={text.tertiary}
            placeholder="ej. Ciudad de México"
            maxLength={100}
          />
        </Field>

        {/* Bio */}
        <Field label="Sobre mí">
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={bio}
            onChangeText={(v) => setValue('bio', v || null, { shouldValidate: true })}
            multiline
            numberOfLines={4}
            maxLength={300}
            placeholderTextColor={text.tertiary}
            placeholder="Cuéntale a la comunidad quién eres..."
          />
          <Text style={[styles.charCount, bio.length >= 280 && styles.charCountWarning]}>
            {bio.length}/300
          </Text>
          {errors.bio && <Text style={styles.fieldError}>{errors.bio.message}</Text>}
        </Field>

        <Divider />

        {/* Fotos */}
        <PhotoGallery
          photos={photos}
          editable
          onAdd={handlePickPhoto}
          onDelete={handleDeletePhoto}
          isUploading={isUploadingPhoto}
        />
        {photoError && <Text style={styles.fieldError}>{photoError}</Text>}

        <Divider />

        {/* TODO: PENDIENTE IMPORTANTE — video de presentación deshabilitado temporalmente */}
        {/* <Field label="Video de presentación">
          {videoState === 'uploading' ? (
            <View style={styles.videoUploadZone}>
              <ActivityIndicator color={colors.purple} size="large" />
              <Text style={styles.videoZoneTitle}>Subiendo video...</Text>
              <View style={styles.videoProgressTrack}>
                <View style={[styles.videoProgressFill, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.videoProgressLabel}>{uploadProgress}%</Text>
            </View>
          ) : videoUrl ? (
            <>
              <View style={styles.videoCard}>
                <Text style={styles.videoCardIcon}>🎥</Text>
                <Text style={styles.videoCardTitle}>Tu video está listo</Text>
              </View>
              <TouchableOpacity
                onPress={handlePickVideo}
                style={styles.videoActionBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.videoActionText}>Reemplazar video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteVideo}
                style={[styles.videoActionBtn, styles.videoDeleteBtn]}
                activeOpacity={0.7}
              >
                <Text style={[styles.videoActionText, styles.videoDeleteText]}>Eliminar video</Text>
              </TouchableOpacity>
              {videoError && <Text style={styles.fieldError}>{videoError}</Text>}
            </>
          ) : (
            <TouchableOpacity
              style={[styles.videoUploadZone, videoState === 'error' && styles.videoUploadZoneError]}
              onPress={handlePickVideo}
              activeOpacity={0.7}
            >
              <Text style={styles.videoZoneIcon}>🎥</Text>
              <Text style={styles.videoZoneTitle}>
                {videoState === 'error'
                  ? (videoError ?? 'Algo salió mal. Toca para reintentar.')
                  : 'Sube tu video de presentación'}
              </Text>
              <Text style={styles.videoZoneSpecs}>MP4 / MOV · máx. 60 seg · 200 MB</Text>
            </TouchableOpacity>
          )}
        </Field>

        <Divider /> */}

        {isLoadingCatalogs ? (
          <ActivityIndicator color={colors.purple} style={{ marginVertical: spacing.xl }} />
        ) : (
          <>
            {/* Identidad de género */}
            <Field label="Identidad de género">
              <ChipSelector
                items={genderCatalog}
                selected={genderIds}
                onToggle={(id) => toggle('gender_identity_ids', id)}
              />
              <DescribeInput
                label="Prefiero describirme como:"
                placeholder="Escribe tu identidad con tus propias palabras..."
                value={customGender}
                onChangeText={(v) => setValue('custom_gender_identity', v || null, { shouldValidate: true })}
              />
            </Field>

            {/* Orientación sexual */}
            <Field label="Orientación sexual">
              <ChipSelector
                items={orientationCatalog}
                selected={orientationIds}
                onToggle={(id) => toggle('orientation_ids', id)}
              />
              <DescribeInput
                label="Prefiero describirme como:"
                placeholder="Escribe tu orientación con tus propias palabras..."
                value={customOrientation}
                onChangeText={(v) => setValue('custom_orientation', v || null, { shouldValidate: true })}
              />
            </Field>

            {/* Pronombres */}
            <Field label="¿Cuáles son tus pronombres?">
              <ChipSelector
                items={pronounCatalog}
                selected={pronounIds}
                onToggle={(id) => toggle('pronoun_ids', id)}
                color={colors.blue}
              />
              <DescribeInput
                label="Prefiero describirme como:"
                placeholder="Escribe tus pronombres con tus propias palabras..."
                value={customPronouns}
                onChangeText={(v) => setValue('custom_pronouns', v || null, { shouldValidate: true })}
              />
            </Field>

            <Divider />

            {/* Intención */}
            <Field label="¿Qué estás buscando?">
              <View style={styles.intentionGrid}>
                {INTENTIONS.map((opt) => {
                  const active = intention === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      activeOpacity={0.7}
                      onPress={() => setValue('intention', opt.value, { shouldValidate: true })}
                      style={[styles.intentionCard, active && styles.intentionCardActive]}
                    >
                      <Text style={[styles.intentionLabel, active && styles.intentionLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.intentionDesc, active && styles.intentionDescActive]}>
                        {opt.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            <Divider />

            {/* Intereses */}
            <Field label="Intereses">
              <ChipSelector
                items={interestCatalog}
                selected={interestIds}
                onToggle={(id) => toggle('interest_ids', id)}
                color={colors.purple}
              />
              <TagInput
                label="¿Algo más que quieras compartir?"
                placeholder="ej. cosplay, astronomía, drag..."
                tags={customInterestTags}
                onTagsChange={handleCustomInterestTagsChange}
                maxTags={10}
              />
            </Field>
          </>
        )}

        {saveError && <Text style={styles.saveError}>{saveError}</Text>}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: surfaces.border }} />;
}

const fieldStyles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.label, color: text.secondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: surfaces.border,
  },
  cancelText: { ...typography.body, color: text.secondary },
  title: { ...typography.h3, color: text.primary },
  saveBtn: {
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.label, color: colors.white, fontFamily: 'PoppinsRounded-SemiBold' },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  input: {
    ...typography.body,
    color: text.primary,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputMultiline: {
    height: 120,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'right',
  },
  charCountWarning: { color: colors.orange },
  fieldError: { ...typography.small, color: colors.rose },
  saveError: { ...typography.small, color: colors.rose, textAlign: 'center' },
  intentionGrid: { gap: spacing.sm },
  intentionCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
  },
  intentionCardActive: {
    borderColor: colors.purple,
    backgroundColor: `${colors.purple}18`,
  },
  intentionLabel: {
    ...typography.body,
    color: text.primary,
    fontFamily: 'PoppinsRounded-SemiBold',
    marginBottom: spacing.xs,
  },
  intentionLabelActive: { color: colors.purple },
  intentionDesc: { ...typography.small, color: text.secondary },
  intentionDescActive: { color: colors.purple },
  bottomSpacer: { height: spacing.xxxl },
  videoUploadZone: {
    backgroundColor: surfaces.card,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  videoUploadZoneError: { borderColor: colors.rose },
  videoZoneIcon: { fontSize: 28 },
  videoZoneTitle: { ...typography.body, fontFamily: 'PoppinsRounded-Medium', color: text.primary, textAlign: 'center' },
  videoZoneSpecs: { ...typography.small, color: text.tertiary, textAlign: 'center' },
  videoProgressTrack: {
    height: 6,
    width: '80%',
    borderRadius: radius.full,
    backgroundColor: surfaces.elevated,
    overflow: 'hidden',
  },
  videoProgressFill: { height: '100%', backgroundColor: colors.purple, borderRadius: radius.full },
  videoProgressLabel: { ...typography.caption, color: text.secondary },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  videoCardIcon: { fontSize: 20 },
  videoCardTitle: { ...typography.body, color: colors.green, fontFamily: 'PoppinsRounded-Medium' },
  videoActionBtn: {
    borderWidth: 1.5,
    borderColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  videoActionText: { ...typography.label, color: colors.purple, fontFamily: 'PoppinsRounded-SemiBold' },
  videoDeleteBtn: { borderColor: colors.rose },
  videoDeleteText: { color: colors.rose },
});
