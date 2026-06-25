import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ExploreProfile } from '../types/matching.types';

interface MatchOverlayProps {
  visible: boolean;
  myPhoto: string | null;
  otherProfile: ExploreProfile;
  onSendMessage: () => void;
  onKeepExploring: () => void;
}

export function MatchOverlay({
  visible,
  myPhoto,
  otherProfile,
  onSendMessage,
  onKeepExploring,
}: MatchOverlayProps) {
  const otherPhoto = otherProfile.photos[0]?.url ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
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
        </View>
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#17171f',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 26,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PoppinsRounded-Regular',
    fontSize: 15,
    color: '#a0a0b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#9b5dff',
  },
  avatarPlaceholder: {
    backgroundColor: '#2a2a38',
  },
  avatarSeparator: {
    width: 12,
  },
  primaryButton: {
    backgroundColor: '#9b5dff',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#9b5dff',
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'PoppinsRounded-SemiBold',
    fontSize: 15,
    color: '#9b5dff',
  },
});
