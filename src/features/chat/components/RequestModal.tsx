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

// COPY PENDIENTE: brand/copies.md no define título ni texto del botón de
// envío para este modal (solicitud de mensaje sin match previo). El
// placeholder del input sí está aprobado (mismo que el input de una
// conversación ya abierta, brand/copies.md → "Chats"). El botón de envío
// reusa "Enviar mensaje" (ya aprobado en brand/copies.md para la misma
// intención de usuario: iniciar contacto) — ver reporte final del agente
// para la decisión completa.
const TITLE_PLACEHOLDER = '[COPY PENDIENTE: título del modal de solicitud]';

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
          {TITLE_PLACEHOLDER} {targetName}
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
