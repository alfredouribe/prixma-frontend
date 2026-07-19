import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { Conversation } from '../types/chat.types';

interface RequestCardProps {
  conversation: Conversation;
  isProcessing: boolean;
  onAccept: (conversation: Conversation) => void;
  onReject: (conversation: Conversation) => void;
}

// Botones "Aceptar"/"Rechazar" — texto literal de spec.md → "Vistas" →
// "Solicitudes" (no está en brand/copies.md, pero spec.md ya lo da como
// copy explícito de UI).
export function RequestCard({ conversation, isProcessing, onAccept, onReject }: RequestCardProps) {
  const other = conversation.other_user;

  return (
    <View style={styles.card} testID={`request-card-${conversation.id}`}>
      {other?.photo ? (
        <Image source={{ uri: other.photo }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={22} color={text.tertiary} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {other?.display_name ?? '—'}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {conversation.last_message?.content ?? ''}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => onAccept(conversation)}
            disabled={isProcessing}
            activeOpacity={0.85}
            testID={`accept-request-${conversation.id}`}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => onReject(conversation)}
            disabled={isProcessing}
            activeOpacity={0.7}
            testID={`reject-request-${conversation.id}`}
          >
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: text.primary,
  },
  message: {
    ...typography.small,
    color: text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: colors.purple,
  },
  acceptButtonText: {
    ...typography.button,
    fontSize: 13,
    color: colors.white,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: surfaces.muted,
  },
  rejectButtonText: {
    ...typography.button,
    fontSize: 13,
    color: text.secondary,
  },
});
