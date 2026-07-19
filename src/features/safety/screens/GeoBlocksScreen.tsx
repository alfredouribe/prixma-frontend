import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGeoBlocks } from '../hooks/useGeoBlocks';
import { GeoBlockItem } from '../components/GeoBlockItem';
import { GeoBlockMap } from '../components/GeoBlockMap';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { CreateGeoBlockPayload } from '../types/safety.types';

// Copy exacto: brand/copies.md → "Bloqueo geográfico".
export function GeoBlocksScreen() {
  const router = useRouter();
  const { geoBlocks, isLoading, error, createGeoBlock, deleteGeoBlock, reload } = useGeoBlocks();
  const [mapVisible, setMapVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(payload: CreateGeoBlockPayload) {
    setIsSaving(true);
    const ok = await createGeoBlock(payload);
    setIsSaving(false);
    if (ok) setMapVisible(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMapVisible(true)}
          style={styles.addButton}
          activeOpacity={0.8}
          testID="add-geoblock-btn"
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.addButtonText}>Agregar zona</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Bloqueo geográfico</Text>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      )}

      {!isLoading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload} activeOpacity={0.8}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && geoBlocks.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>No tienes zonas de bloqueo geográfico</Text>
        </View>
      )}

      {!isLoading && !error && geoBlocks.length > 0 && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {geoBlocks.map((geoBlock) => (
            <GeoBlockItem key={geoBlock.id} geoBlock={geoBlock} onDelete={deleteGeoBlock} />
          ))}
        </ScrollView>
      )}

      <GeoBlockMap
        visible={mapVisible}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={() => setMapVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  retryText: { ...typography.button, color: colors.white },
});
