import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { useReport } from '../hooks/useReport';
import { CHAT_EVIDENCE_LIMIT, useReportEvidence } from '../hooks/useReportEvidence';
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
  targetName: string;
  onClose: () => void;
  /** Se llama tras cerrar el modal, después de que el usuario toca "Entendido" en la confirmación. */
  onReported?: () => void;
}

// Copy exacto: brand/copies.md → "Reporte con bloqueo automático".
export function ReportModal({ visible, targetId, targetName, onClose, onReported }: ReportModalProps) {
  const { submitReport, isLoading, error } = useReport();
  const { profile, chatMessages, chatTotal, isLoading: isLoadingEvidence } = useReportEvidence(
    targetId,
    visible,
  );
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const identityLine = profile
    ? [
        profile.pronouns?.map((p) => p.label).join(' / '),
        profile.gender_identities?.map((g) => g.label).join(', '),
        profile.orientations?.map((o) => o.label).join(', '),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const moreMessagesCount = chatTotal !== null
    ? Math.max(0, Math.min(chatTotal, CHAT_EVIDENCE_LIMIT) - chatMessages.length)
    : 0;

  function handleClose() {
    setReason(null);
    setDescription('');
    setSubmitted(false);
    onClose();
  }

  function handleDone() {
    handleClose();
    onReported?.();
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
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={colors.green}
              style={styles.confirmIcon}
              testID="report-confirm-icon"
            />
            <Text style={styles.confirmTitle}>Reporte enviado</Text>
            <Text style={styles.confirmText}>
              Gracias por ayudar a mantener Prixma segure. {targetName} ha sido bloqueade automáticamente.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDone}
              activeOpacity={0.85}
              testID="report-done-btn"
            >
              <Text style={styles.primaryButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Reportar perfil</Text>

            <Text style={styles.sectionLabel}>¿Qué pasó?</Text>
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

            {(isLoadingEvidence || profile) && (
              <View style={styles.evidenceCard} testID="report-evidence-card">
                <Text style={styles.evidenceLabel}>Evidencia adjunta automáticamente</Text>

                {profile && (
                  <View style={styles.evidenceProfile} testID="report-evidence-profile">
                    <View style={styles.evidencePhotos}>
                      {profile.photo_url ? (
                        <Image source={{ uri: profile.photo_url }} style={styles.evidenceMainPhoto} />
                      ) : (
                        <View style={[styles.evidenceMainPhoto, styles.evidencePhotoPlaceholder]}>
                          <Ionicons name="person" size={20} color={text.tertiary} />
                        </View>
                      )}
                      {profile.photos?.slice(0, 4).map((photo) => (
                        <Image key={photo.id} source={{ uri: photo.url }} style={styles.evidenceThumb} />
                      ))}
                    </View>

                    {profile.bio && (
                      <Text style={styles.evidenceBio} numberOfLines={2}>
                        {profile.bio}
                      </Text>
                    )}

                    {identityLine ? <Text style={styles.evidenceIdentity}>{identityLine}</Text> : null}
                  </View>
                )}

                {chatMessages.length > 0 && (
                  <View style={styles.evidenceChat} testID="report-evidence-chat">
                    <Text style={styles.evidenceChatLabel}>Últimos 20 mensajes del chat</Text>
                    {chatMessages.map((message) => (
                      <Text key={message.id} style={styles.evidenceChatMessage} numberOfLines={1}>
                        <Text style={styles.evidenceChatSender}>
                          {message.sender_id === targetId ? targetName : 'Tú'}:{' '}
                        </Text>
                        {message.content}
                      </Text>
                    ))}
                    {moreMessagesCount > 0 && (
                      <Text style={styles.evidenceChatMore}>
                        + {moreMessagesCount} mensajes anteriores incluidos
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.note}>
              🚫 Tolerancia cero — toda denuncia tiene consecuencias reales. Al enviar este reporte,{' '}
              {targetName} será bloqueade automáticamente.
            </Text>

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
  sectionLabel: {
    ...typography.label,
    color: text.secondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.xs,
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
  evidenceCard: {
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    backgroundColor: surfaces.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  evidenceLabel: {
    ...typography.label,
    color: text.secondary,
  },
  evidenceProfile: {
    gap: spacing.xs,
  },
  evidencePhotos: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  evidenceMainPhoto: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: surfaces.elevated,
  },
  evidencePhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: surfaces.elevated,
  },
  evidenceBio: {
    ...typography.small,
    color: text.secondary,
  },
  evidenceIdentity: {
    ...typography.caption,
    color: text.tertiary,
  },
  evidenceChat: {
    gap: 2,
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: surfaces.border,
  },
  evidenceChatLabel: {
    ...typography.caption,
    color: text.tertiary,
    marginBottom: spacing.xs,
  },
  evidenceChatMessage: {
    ...typography.small,
    color: text.secondary,
  },
  evidenceChatSender: {
    fontFamily: 'PoppinsRounded-Medium',
    color: text.primary,
  },
  evidenceChatMore: {
    ...typography.caption,
    color: colors.purple,
    marginTop: spacing.xs,
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
    gap: spacing.md,
    alignItems: 'center',
  },
  confirmIcon: {
    marginBottom: spacing.xs,
  },
  confirmTitle: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
