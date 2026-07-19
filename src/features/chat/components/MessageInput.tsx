import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

const MAX_MESSAGE_LENGTH = 500;

interface MessageInputProps {
  onSend: (content: string) => void;
  isSending?: boolean;
}

// Copy exacto: brand/copies.md → "Chats" → "Placeholder input mensaje".
export function MessageInput({ onSend, isSending = false }: MessageInputProps) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const isDisabled = trimmed.length === 0 || value.length > MAX_MESSAGE_LENGTH || isSending;
  const isNearLimit = value.length > MAX_MESSAGE_LENGTH - 50;

  function handleSend() {
    if (isDisabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Escribe algo..."
          placeholderTextColor={text.tertiary}
          value={value}
          onChangeText={setValue}
          multiline
          maxLength={MAX_MESSAGE_LENGTH + 20}
          testID="message-input"
        />
        {isNearLimit && (
          <Text style={styles.counter}>
            {value.length}/{MAX_MESSAGE_LENGTH}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityLabel="Enviar"
        testID="message-send-btn"
      >
        {isSending ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Ionicons name="send" size={18} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: surfaces.bg,
    borderTopWidth: 0.5,
    borderTopColor: surfaces.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: surfaces.card,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  input: {
    ...typography.body,
    color: text.primary,
    paddingTop: 0,
    paddingBottom: 0,
  },
  counter: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
