import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyProfile } from '../hooks/useMyProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { ProfileBio } from '../components/ProfileBio';
import { ProfileInterests } from '../components/ProfileInterests';
import { PhotoGallery } from '../components/PhotoGallery';
import { ProfileSettingsMenu } from '../components/ProfileSettingsMenu';
import { VideoCard } from '../components/VideoCard';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

export function MyProfileScreen() {
  const { profile, isLoading, error, reload } = useMyProfile();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={reload} activeOpacity={0.8}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader profile={profile} isOwn />

        <ProfileStats stats={profile.statistics} />

        {profile.video_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mi video</Text>
            {profile.video_processed ? (
              <VideoCard videoUrl={profile.video_url} label="Video de presentación" />
            ) : (
              <View style={styles.videoProcessing}>
                <Text style={styles.videoProcessingText}>⏳  Tu video se está procesando...</Text>
              </View>
            )}
          </View>
        )}

        <ProfileBio bio={profile.bio} intention={profile.intention} />

        <ProfileInterests
          interests={profile.interests ?? []}
          customInterests={profile.custom_interests}
        />

        <PhotoGallery photos={profile.photos ?? []} />

        <ProfileSettingsMenu verificationStatus={profile.verification_status} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: surfaces.bg,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  centered: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  videoProcessing: {
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  videoProcessingText: {
    ...typography.small,
    color: text.secondary,
    fontFamily: 'PoppinsRounded-Medium',
  },
});
