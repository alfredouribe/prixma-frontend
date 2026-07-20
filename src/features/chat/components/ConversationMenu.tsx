import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface ConversationMenuProps {
  visible: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onReport: () => void;
  onBlock: () => void;
}

/**
 * Bottom sheet del menú ⋯ de `ConversationScreen`. Puramente presentacional
 * (la lógica de negocio — navegar, abrir BlockModal/ReportModal — vive en el
 * screen). Copy: `Ver perfil` / `Reportar` / `Bloquear` / `Cancelar`, ya
 * aprobados en brand/copies.md y reutilizados de PublicProfileScreen — sin
 * título ni subtítulos por decisión del humano 2026-07-19. Referencia visual:
 * design/chat/prixma_chat_conversation.html.
 */
export function ConversationMenu({
  visible,
  onClose,
  onViewProfile,
  onReport,
  onBlock,
}: ConversationMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} testID="conversation-menu-backdrop" />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={onViewProfile}
          testID="menu-option-view-profile"
        >
          <Ionicons name="person-outline" size={20} color={text.secondary} />
          <Text style={styles.rowText}>Ver perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={onReport}
          testID="menu-option-report"
        >
          <Ionicons name="flag-outline" size={20} color={text.secondary} />
          <Text style={styles.rowText}>Reportar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={onBlock}
          testID="menu-option-block"
        >
          <Ionicons name="person-remove-outline" size={20} color={colors.rose} />
          <Text style={[styles.rowText, styles.rowTextDanger]}>Bloquear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={onClose}
          testID="menu-cancel-btn"
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: surfaces.border,
  },
  rowText: {
    ...typography.body,
    color: text.primary,
  },
  rowTextDanger: {
    color: colors.rose,
  },
  cancelButton: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  cancelButtonText: {
    ...typography.button,
    color: text.secondary,
  },
});
