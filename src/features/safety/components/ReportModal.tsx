import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { useReport } from '../hooks/useReport';
import type { ReportReason } from '../types/safety.types';

const MAX_DESCRIPTION_LENGTH = 300;

// Motivos — enum real de `ReportRequest` (backend), etiquetas del enunciado
// literal en features/safety/specs/spec.md → "Reportar perfil".
const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Acoso' },
  { value: 'discrimination', label: 'Discriminación' },
  { value: 'fake_profile', label: 'Perfil falso' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'other', label: 'Otro' },
];

interface ReportModalProps {
  visible: boolean;
  targetId: string;
  onClose: () => void;
}

// Copy exacto: brand/copies.md → "Reportar".
export function ReportModal({ visible, targetId, onClose }: ReportModalProps) {
  const { submitReport, isLoading, error } = useReport();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    setReason(null);
    setDescription('');
    setSubmitted(false);
    onClose();
  }

  async function handleSubmit() {
    if (!reason) return;
    const ok = await submitReport(targetId, reason, description || null);
    if (ok) setSubmitted(true);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {submitted ? (
          <View style={styles.confirmWrap}>
            <Text style={styles.confirmText}>
              Reporte enviado. Gracias por ayudar a mantener Prixma segure.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleClose}
              activeOpacity={0.85}
              testID="report-done-btn"
            >
              <Text style={styles.primaryButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Reportar perfil</Text>
            <Text style={styles.subtitle}>Tu reporte será revisado por nuestro equipo.</Text>

            <View style={styles.chips}>
              {REASON_OPTIONS.map((opt) => {
                const selected = reason === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setReason(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    testID={`report-reason-${opt.value}`}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Describe lo que pasó (opcional)"
              placeholderTextColor={text.tertiary}
              value={description}
              onChangeText={(v) => setDescription(v.slice(0, MAX_DESCRIPTION_LENGTH))}
              multiline
              maxLength={MAX_DESCRIPTION_LENGTH}
              testID="report-description-input"
            />
            <Text style={styles.counter}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>

            <Text style={styles.note}>Tolerancia cero — toda denuncia tiene consecuencias reales.</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, (!reason || isLoading) && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={!reason || isLoading}
              activeOpacity={0.85}
              testID="report-submit-btn"
            >
              <Text style={styles.primaryButtonText}>Enviar reporte</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
    maxHeight: '85%',
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
  content: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: text.primary,
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: surfaces.muted,
    backgroundColor: surfaces.card,
  },
  chipSelected: {
    borderColor: colors.rose,
    backgroundColor: 'rgba(255, 94, 125, 0.15)',
  },
  chipText: {
    ...typography.small,
    color: text.secondary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  chipTextSelected: {
    color: colors.rose,
  },
  textArea: {
    minHeight: 88,
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
  },
  note: {
    ...typography.small,
    color: colors.rose,
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  confirmWrap: {
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  confirmText: {
    ...typography.body,
    color: text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
