import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileBio } from '../components/ProfileBio';
import { ProfileInterests } from '../components/ProfileInterests';
import { VideoCard } from '../components/VideoCard';
import { useBlocks } from '../../safety/hooks/useBlocks';
import { BlockModal } from '../../safety/components/BlockModal';
import { ReportModal } from '../../safety/components/ReportModal';
import { chatService } from '../../chat/services/chatService';
import { conversationRoute } from '../../chat/utils/conversationRoute';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';

interface PublicProfileScreenProps {
  uuid: string;
}

export function PublicProfileScreen({ uuid }: PublicProfileScreenProps) {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { profile, isLoading, error } = usePublicProfile(uuid);
  const { blockUser, error: blockError } = useBlocks();

  const [menuVisible, setMenuVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  // El botón "Enviar mensaje" solo aparece si ya existe una conversación
  // (= ya hubo match) — no existe todavía flujo para escribir sin match
  // (ver features/chat/specs/spec.md, "Solicitudes" queda para el futuro,
  // decisión 2026-07-19). `null` = aún verificando, no se muestra nada.
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    chatService
      .getConversationWithUser(profile.id)
      .then((conversation) => {
        if (!cancelled) setConversationId(conversation?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setConversationId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  function goBack() {
    if (from === 'chats') {
      router.replace('/(app)/chats');
    } else {
      router.back();
    }
  }

  function handleSendMessage() {
    if (!conversationId) return;
    router.push(conversationRoute(conversationId));
  }

  async function handleConfirmBlock() {
    if (!profile) return;
    setIsBlocking(true);
    const block = await blockUser(profile.id);
    setIsBlocking(false);

    if (block) {
      setBlockModalVisible(false);
      Alert.alert('', `Listo. ${profile.display_name} ha sido bloqueade.`, [
        { text: 'OK', onPress: goBack },
      ]);
    } else {
      Alert.alert('', blockError ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.');
    }
  }

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

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
        accessibilityLabel="Más opciones"
        testID="profile-menu-btn"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader profile={profile} isOwn={false} />

        {profile.has_video && (
          <View style={styles.videoSection}>
            {profile.video_url ? (
              <VideoCard videoUrl={profile.video_url} label="Video de presentación" />
            ) : (
              <View style={styles.videoLocked} testID="video-locked-teaser">
                <View style={styles.videoLockedIcon}>
                  <Ionicons name="lock-closed" size={18} color={colors.white} />
                </View>
                <Text style={styles.videoLockedText}>
                  ¿Quieres saber más de mí? Empieza por mi video de presentación.
                </Text>
              </View>
            )}
          </View>
        )}

        <ProfileBio bio={profile.bio} intention={profile.intention} />

        <ProfileInterests interests={profile.interests ?? []} customInterests={profile.custom_interests} />

        {conversationId && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleSendMessage}
            activeOpacity={0.85}
            testID="send-message-btn"
          >
            <Text style={styles.messageButtonText}>Enviar mensaje</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Menú ⋯ */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
        <View style={styles.menuSheet}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            testID="menu-option-block"
            onPress={() => {
              setMenuVisible(false);
              setBlockModalVisible(true);
            }}
          >
            <Ionicons name="person-remove-outline" size={20} color={colors.rose} />
            <Text style={styles.menuRowText}>Bloquear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            testID="menu-option-report"
            onPress={() => {
              setMenuVisible(false);
              setReportModalVisible(true);
            }}
          >
            <Ionicons name="flag-outline" size={20} color={colors.rose} />
            <Text style={styles.menuRowText}>Reportar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <BlockModal
        visible={blockModalVisible}
        targetName={profile.display_name}
        isSubmitting={isBlocking}
        onConfirm={handleConfirmBlock}
        onClose={() => setBlockModalVisible(false)}
      />

      <ReportModal
        visible={reportModalVisible}
        targetId={profile.id}
        onClose={() => setReportModalVisible(false)}
      />
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
  menuBtn: {
    position: 'absolute',
    top: 52,
    left: spacing.xl,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  videoLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    opacity: 0.85,
  },
  videoLockedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: surfaces.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLockedText: {
    ...typography.small,
    color: text.secondary,
    flex: 1,
  },
  messageButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacer: { height: spacing.xxxl },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuSheet: {
    position: 'absolute',
    top: 92,
    left: spacing.xl,
    backgroundColor: surfaces.elevated,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    paddingVertical: spacing.xs,
    minWidth: 170,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuRowText: {
    ...typography.body,
    color: text.primary,
  },
});
