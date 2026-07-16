import { useEffect } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { ExploreProfile } from '../types/matching.types';

interface MatchOverlayProps {
  visible: boolean;
  myPhoto: string | null;
  otherProfile: ExploreProfile;
  onSendMessage: () => void;
  onKeepExploring: () => void;
  onViewFull: () => void;
}

// Match overlay: scale + fade, 400ms — design-system.md → "Animation Guidelines"
const ANIMATION_DURATION = 400;

export function MatchOverlay({
  visible,
  myPhoto,
  otherProfile,
  onSendMessage,
  onKeepExploring,
  onViewFull,
}: MatchOverlayProps) {
  const otherPhoto = otherProfile.photos[0]?.url ?? null;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      scale.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      opacity.value = 0;
      scale.value = 0.85;
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.title}>¡Es un match! 🌟</Text>
          <Text style={styles.subtitle}>
            Tú y {otherProfile.display_name} se gustaron mutuamente.
          </Text>

          <View style={styles.avatars}>
            {myPhoto ? (
              <Image source={{ uri: myPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <View style={styles.avatarSeparator} />
            {otherPhoto ? (
              <Image source={{ uri: otherPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSendMessage}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Enviar mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onKeepExploring}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Seguir explorando</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onViewFull} accessibilityRole="button">
            <Text style={styles.viewFullLink}>Ver perfil completo →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...typography.h1,
    color: text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.purple,
  },
  avatarPlaceholder: {
    backgroundColor: surfaces.border,
  },
  avatarSeparator: {
    width: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryButton: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.purple,
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.purple,
  },
  viewFullLink: {
    ...typography.small,
    color: text.tertiary,
    marginTop: spacing.md,
  },
});
