import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { GeoBlock } from '../types/safety.types';

interface GeoBlockItemProps {
  geoBlock: GeoBlock;
  onDelete: (id: string) => void;
}

// Copy exacto: brand/copies.md → "Bloqueo geográfico".
export function GeoBlockItem({ geoBlock, onDelete }: GeoBlockItemProps) {
  function confirmDelete() {
    Alert.alert('¿Eliminar esta zona?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, eliminar', style: 'destructive', onPress: () => onDelete(geoBlock.id) },
    ]);
  }

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name="location" size={18} color={colors.purple} />
      </View>

      <View style={styles.info}>
        {geoBlock.label ? <Text style={styles.label}>{geoBlock.label}</Text> : null}
        <Text style={styles.radius}>{geoBlock.radius_km} km</Text>
      </View>

      <TouchableOpacity
        onPress={confirmDelete}
        activeOpacity={0.7}
        accessibilityLabel="Eliminar zona"
        testID={`delete-geoblock-${geoBlock.id}`}
      >
        <Ionicons name="close" size={18} color={text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(155, 93, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.body,
    color: text.primary,
    fontFamily: 'PoppinsRounded-Medium',
  },
  radius: {
    ...typography.small,
    color: text.secondary,
  },
});
