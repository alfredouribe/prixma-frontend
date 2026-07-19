import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { formatRelativeTime } from '../utils/formatChatTime';
import type { Conversation } from '../types/chat.types';

// Copy exacto: brand/copies.md → "Chat" → "Bandeja de mensajes".
const NO_MESSAGES_PREVIEW = '¡Hicieron match! Envía el primer mensaje';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const other = conversation.other_user;
  const hasUnread = conversation.unread_count > 0;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
      testID={`conversation-item-${conversation.id}`}
    >
      {other?.photo ? (
        <Image source={{ uri: other.photo }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={20} color={text.tertiary} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {other?.display_name ?? '—'}
          </Text>
          {other && other.pronouns.length > 0 && (
            <Text style={styles.pronouns} numberOfLines={1}>
              {other.pronouns.join(' / ')}
            </Text>
          )}
        </View>
        <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
          {conversation.last_message?.content ?? NO_MESSAGES_PREVIEW}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.time}>
          {formatRelativeTime(conversation.last_message?.created_at ?? conversation.updated_at)}
        </Text>
        {hasUnread && (
          <View style={styles.badge} testID={`unread-badge-${conversation.id}`}>
            <Text style={styles.badgeText}>{conversation.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: text.primary,
    flexShrink: 1,
  },
  pronouns: {
    ...typography.caption,
    color: text.tertiary,
    flexShrink: 1,
  },
  preview: {
    ...typography.small,
    color: text.secondary,
  },
  previewUnread: {
    color: text.primary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  trailing: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: text.tertiary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
});
