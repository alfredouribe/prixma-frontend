import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileBio } from '../components/ProfileBio';
import { ProfileInterests } from '../components/ProfileInterests';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

const { width } = Dimensions.get('window');

interface PublicProfileScreenProps {
  uuid: string;
}

export function PublicProfileScreen({ uuid }: PublicProfileScreenProps) {
  const router = useRouter();
  const { profile, isLoading, error } = usePublicProfile(uuid);

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
        <Text style={styles.errorText}>
          {error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const allPhotos = profile.photos ?? [];

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader profile={profile} isOwn={false} />

        {allPhotos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carouselRow}
            contentContainerStyle={styles.carouselContent}
          >
            {allPhotos.map((photo, index) => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={[styles.thumbnail, index === 0 && styles.thumbnailActive]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <ProfileBio bio={profile.bio} intention={profile.intention} />

        <ProfileInterests interests={profile.interests ?? []} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: surfaces.bg },
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
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
  },
  backBtnText: { ...typography.body, color: text.secondary },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.xl,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  carouselRow: {
    marginTop: spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    opacity: 0.6,
  },
  thumbnailActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.purple,
  },
  bottomSpacer: { height: spacing.xxxl },
});
