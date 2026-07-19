import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConversations } from '../hooks/useConversations';
import { useChatRequests } from '../hooks/useChatRequests';
import { ConversationList } from '../components/ConversationList';
import { RequestCard } from '../components/RequestCard';
import { conversationRoute } from '../utils/conversationRoute';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { Conversation } from '../types/chat.types';

type Tab = 'matches' | 'requests';

// Copy exacto: brand/copies.md → "Chat" → "Bandeja de mensajes".
const EMPTY_MATCHES = 'Haz match para empezar a platicar';
// COPY PENDIENTE: la pestaña "Solicitudes" queda construida pero sin
// exponerse (decisión 2026-07-19, ver features/chat/specs/spec.md) — no hay
// forma de llegar a este estado vacío todavía, así que su copy queda
// pendiente de aprobación para cuando se active esa fase.
const EMPTY_REQUESTS = '[COPY PENDIENTE: estado vacío — sin solicitudes]';

// Copy exacto: brand/copies.md → "Chats".
export function ConversationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const { matches, requests, isLoading, isRefreshing, error, refresh } = useConversations();
  const { acceptRequest, rejectRequest, processingId } = useChatRequests();

  function handlePressConversation(conversation: Conversation) {
    router.push(conversationRoute(conversation.id));
  }

  async function handleAccept(conversation: Conversation) {
    const updated = await acceptRequest(conversation.id);
    if (updated) refresh();
  }

  async function handleReject(conversation: Conversation) {
    const updated = await rejectRequest(conversation.id);
    if (updated) refresh();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Mensajes</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.tabActive]}
          onPress={() => setActiveTab('matches')}
          activeOpacity={0.7}
          testID="tab-matches"
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.7}
          testID="tab-requests"
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Solicitudes{requests.length > 0 ? ` (${requests.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {activeTab === 'matches' ? (
        <ConversationList
          conversations={matches}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
          onPressConversation={handlePressConversation}
          emptyTitle={EMPTY_MATCHES}
        />
      ) : requests.length === 0 && !isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{EMPTY_REQUESTS}</Text>
        </View>
      ) : (
        <View style={styles.requestsList}>
          {requests.map((conversation) => (
            <RequestCard
              key={conversation.id}
              conversation={conversation}
              isProcessing={processingId === conversation.id}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  title: {
    ...typography.h1,
    color: text.primary,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: surfaces.card,
    borderRadius: radius.full,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.purple,
  },
  tabText: {
    ...typography.label,
    color: text.tertiary,
  },
  tabTextActive: {
    color: colors.white,
  },
  errorBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  requestsList: {
    flex: 1,
  },
});
