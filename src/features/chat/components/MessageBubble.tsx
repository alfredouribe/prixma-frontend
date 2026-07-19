import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { formatMessageTime } from '../utils/formatChatTime';
import type { Message } from '../types/chat.types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

// Burbuja propia: fondo purple, alineada a la derecha. Burbuja ajena: fondo
// surface, alineada a la izquierda — spec.md → "Vistas" → "Conversación individual".
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
          {message.content}
        </Text>
      </View>
      <View style={[styles.meta, isOwn ? styles.metaOwn : styles.metaOther]}>
        <Text style={styles.time}>{formatMessageTime(message.created_at)}</Text>
        {isOwn && (
          <Ionicons
            name="checkmark-done"
            size={14}
            color={message.read_at ? colors.blue : text.tertiary}
            testID={`read-receipt-${message.id}`}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  rowOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleOwn: {
    backgroundColor: colors.purple,
    borderBottomRightRadius: radius.sm,
  },
  bubbleOther: {
    backgroundColor: surfaces.card,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: surfaces.border,
  },
  content: {
    ...typography.body,
  },
  contentOwn: {
    color: colors.white,
  },
  contentOther: {
    color: text.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
    paddingHorizontal: spacing.xs,
  },
  metaOwn: {
    justifyContent: 'flex-end',
  },
  metaOther: {
    justifyContent: 'flex-start',
  },
  time: {
    ...typography.caption,
    color: text.tertiary,
  },
});
