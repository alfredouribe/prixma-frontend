import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConversation } from '../hooks/useConversation';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { useAuthStore } from '../../../stores/authStore';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { Message } from '../types/chat.types';

interface ConversationScreenProps {
  conversationId: string;
}

export function ConversationScreen({ conversationId }: ConversationScreenProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    isLoadingMore,
    hasMoreMessages,
    error,
    sendMessage,
    loadOlderMessages,
  } = useConversation(conversationId);

  const other = conversation?.other_user;
  // FlatList invertida: más reciente al fondo, `onEndReached` carga mensajes
  // más antiguos (visualmente hacia arriba).
  const invertedMessages = [...messages].reverse();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      ) : error && !conversation ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={text.primary} />
            </TouchableOpacity>

            {other?.photo ? (
              <Image source={{ uri: other.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={16} color={text.tertiary} />
              </View>
            )}

            <Text style={styles.name} numberOfLines={1}>
              {other?.display_name ?? '—'}
            </Text>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <FlatList
              data={invertedMessages}
              keyExtractor={(item: Message) => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} isOwn={item.sender_id === currentUserId} />
              )}
              inverted
              contentContainerStyle={styles.messagesContent}
              onEndReached={hasMoreMessages ? loadOlderMessages : undefined}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isLoadingMore ? <ActivityIndicator color={colors.purple} style={styles.loadingMore} /> : null
              }
              showsVerticalScrollIndicator={false}
            />

            {error && (
              <View style={styles.inlineErrorWrap}>
                <Text style={styles.inlineError}>{error}</Text>
              </View>
            )}

            <MessageInput onSend={sendMessage} isSending={isSending} />
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  flex: { flex: 1 },
  centered: {
    flex: 1,
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
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: surfaces.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h3,
    color: text.primary,
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  loadingMore: {
    marginVertical: spacing.md,
  },
  inlineErrorWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  inlineError: {
    ...typography.small,
    color: colors.rose,
    textAlign: 'center',
  },
});
