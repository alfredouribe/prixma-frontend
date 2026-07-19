import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface BlockModalProps {
  visible: boolean;
  targetName: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Copy exacto: brand/copies.md → "Bloqueo".
export function BlockModal({ visible, targetName, isSubmitting = false, onConfirm, onClose }: BlockModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>¿Bloquear a {targetName}?</Text>
          <Text style={styles.message}>
            No verás su perfil y elle no verá el tuyo. No se le notificará.
          </Text>

          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.buttonDisabled]}
            onPress={onConfirm}
            disabled={isSubmitting}
            activeOpacity={0.85}
            testID="block-confirm-btn"
          >
            <Text style={styles.confirmButtonText}>Sí, bloquear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting}
            activeOpacity={0.7}
            testID="block-cancel-btn"
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: surfaces.elevated,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  confirmButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
  cancelButton: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: text.secondary,
  },
});
