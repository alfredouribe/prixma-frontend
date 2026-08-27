import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

const MAX_MESSAGE_LENGTH = 500;

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese). El placeholder del input y el botón de envío
// ya usaban copy aprobado, sin cambios.
const TITLE = 'Envíale un mensaje a';

interface RequestModalProps {
  visible: boolean;
  targetName: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (content: string) => void;
  onClose: () => void;
}

export function RequestModal({
  visible,
  targetName,
  isSubmitting = false,
  error = null,
  onSubmit,
  onClose,
}: RequestModalProps) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const isDisabled = trimmed.length === 0 || value.length > MAX_MESSAGE_LENGTH || isSubmitting;

  function handleClose() {
    setValue('');
    onClose();
  }

  function handleSubmit() {
    if (isDisabled) return;
    onSubmit(trimmed);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>
          {TITLE} {targetName}
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Escribe algo..."
          placeholderTextColor={text.tertiary}
          value={value}
          onChangeText={setValue}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          testID="request-message-input"
        />
        <Text style={styles.counter}>
          {value.length}/{MAX_MESSAGE_LENGTH}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={isDisabled}
          activeOpacity={0.85}
          testID="request-submit-btn"
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar mensaje</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: surfaces.elevated,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: surfaces.muted,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: text.primary,
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 100,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    backgroundColor: surfaces.card,
    color: text.primary,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.body,
  },
  counter: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
    marginTop: spacing.sm,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
