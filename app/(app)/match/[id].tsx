import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../src/lib/theme';

/**
 * Pantalla completa de celebración de match. No pide datos a la API: recibe
 * nombre y foto del otro usuario como query params (pasados desde
 * ExploreScreen al navegar), porque todavía no existe un endpoint de detalle
 * de match individual. Ver features/matching/specs/plan.md → "app/(app)/match/[id].tsx".
 */
export default function MatchScreen() {
  const router = useRouter();
  const { name, photo, myPhoto } = useLocalSearchParams<{
    id: string;
    name: string;
    photo?: string;
    myPhoto?: string;
  }>();

  function handleSendMessage() {
    router.push('/(app)/chats');
  }

  function handleKeepExploring() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.purple, colors.rose, colors.orange]}
        start={{ x: 0.33, y: 0.03 }}
        end={{ x: 0.67, y: 0.97 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.darkOverlay} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.sparks}>✨ ✨ ✨</Text>

          <View style={styles.avatarsWrap}>
            {myPhoto ? (
              <Image source={{ uri: myPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={36} color={colors.white} />
              </View>
            )}
            {photo ? (
              <Image source={{ uri: photo }} style={[styles.avatar, styles.avatarOverlap]} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, styles.avatarOverlap]}>
                <Ionicons name="person" size={36} color={colors.white} />
              </View>
            )}
          </View>

          <Text style={styles.title}>¡Es un match! 🌟</Text>
          <Text style={styles.subtitle}>
            Tú y {name} se gustaron mutuamente.{'\n'}¿Le mandas un mensaje?
          </Text>

          <Text style={styles.sparks}>✨ ✨ ✨</Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendMessage}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Enviar mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostButton}
            onPress={handleKeepExploring}
            accessibilityRole="button"
          >
            <Text style={styles.ghostButtonText}>Seguir explorando</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,20,0.55)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sparks: {
    ...typography.body,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  avatarsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  avatarPlaceholder: {
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlap: {
    marginLeft: -20,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-Bold',
  },
  ghostButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
