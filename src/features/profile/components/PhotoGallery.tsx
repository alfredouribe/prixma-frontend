import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { colors, surfaces, text, typography, radius, spacing } from '../../../lib/theme';
import type { ProfilePhoto } from '../types/profile.types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - spacing.xl * 2 - spacing.sm * 2) / 3;

interface PhotoGalleryProps {
  photos: ProfilePhoto[];
  editable?: boolean;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
  isUploading?: boolean;
}

export function PhotoGallery({
  photos,
  editable = false,
  onAdd,
  onDelete,
  isUploading = false,
}: PhotoGalleryProps) {
  const canAdd = editable && photos.length < 6;

  function confirmDelete(id: string) {
    Alert.alert('Eliminar foto', '¿Seguro que quieres eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete?.(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Fotos</Text>
      <View style={styles.grid}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.cell}>
            <Image source={{ uri: photo.url }} style={styles.photo} resizeMode="cover" />
            {editable && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(photo.id)}
                activeOpacity={0.8}
                testID={`delete-photo-${photo.id}`}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            )}
            {photo.position === 1 && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Principal</Text>
              </View>
            )}
          </View>
        ))}

        {canAdd && (
          <TouchableOpacity
            style={styles.addCell}
            onPress={onAdd}
            disabled={isUploading}
            activeOpacity={0.7}
            testID="add-photo-btn"
          >
            {isUploading ? (
              <Text style={styles.addIcon}>⏳</Text>
            ) : (
              <>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addLabel}>Añadir</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {photos.length === 6 && editable && (
          <View style={[styles.addCell, styles.addCellDisabled]}>
            <Text style={styles.addIcon}>📷</Text>
            <Text style={styles.addLabelDisabled}>Máx. 6</Text>
          </View>
        )}
      </View>

      {editable && (
        <Text style={styles.hint}>
          {photos.length}/6 fotos · La primera es tu foto principal
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 1.3,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'PoppinsRounded-Bold',
  },
  mainBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.purple,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mainBadgeText: {
    ...typography.caption,
    color: colors.white,
  },
  addCell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 1.3,
    borderRadius: radius.md,
    backgroundColor: surfaces.elevated,
    borderWidth: 1.5,
    borderColor: surfaces.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addCellDisabled: {
    opacity: 0.4,
  },
  addIcon: {
    fontSize: 24,
    color: text.tertiary,
  },
  addLabel: {
    ...typography.caption,
    color: colors.purple,
    fontFamily: 'PoppinsRounded-Medium',
  },
  addLabelDisabled: {
    ...typography.caption,
    color: text.tertiary,
  },
  hint: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'center',
  },
});
