import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlocks } from '../hooks/useBlocks';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { Block } from '../types/safety.types';

// Copy exacto: brand/copies.md → "Bloqueades (pantalla de gestión)".
export function BlockedUsersScreen() {
  const router = useRouter();
  const { blocks, isLoading, error, unblockUser, reload } = useBlocks();

  function confirmUnblock(block: Block) {
    const name = block.blocked_user?.display_name ?? '';
    Alert.alert(`¿Desbloquear a ${name}?`, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, desbloquear', style: 'destructive', onPress: () => unblockUser(block.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={text.primary} />
        </TouchableOpacity>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.purple} />
        <View style={styles.backButton} />
      </View>

      <Text style={styles.title}>Bloqueades</Text>

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

      {!isLoading && !error && blocks.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>No has bloqueado a nadie</Text>
        </View>
      )}

      {!isLoading && !error && blocks.length > 0 && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {blocks.map((block) => (
            <View key={block.id} style={styles.row}>
              {block.blocked_user?.photo ? (
                <Image source={{ uri: block.blocked_user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={18} color={text.tertiary} />
                </View>
              )}
              <Text style={styles.name} numberOfLines={1}>
                {block.blocked_user?.display_name ?? '—'}
              </Text>
              <TouchableOpacity
                onPress={() => confirmUnblock(block)}
                activeOpacity={0.7}
                accessibilityLabel="Desbloquear"
                testID={`unblock-btn-${block.id}`}
              >
                <Ionicons name="close-circle-outline" size={22} color={colors.rose} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    marginBottom: spacing.xl,
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
  title: {
    ...typography.h1,
    color: text.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: surfaces.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.body,
    color: text.primary,
    flex: 1,
  },
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
