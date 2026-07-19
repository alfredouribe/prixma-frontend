import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, text, typography } from '../../../lib/theme';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '../types/chat.types';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onPressConversation: (conversation: Conversation) => void;
  emptyTitle: string;
}

export function ConversationList({
  conversations,
  isLoading,
  isRefreshing,
  onRefresh,
  onPressConversation,
  emptyTitle,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ConversationItem conversation={item} onPress={onPressConversation} />}
      contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.purple} />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{emptyTitle}</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  emptyContainer: {
    flexGrow: 1,
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
});
