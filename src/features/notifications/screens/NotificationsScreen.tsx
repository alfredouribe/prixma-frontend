import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from '../components/NotificationItem';
import { colors, spacing, surfaces, text, typography } from '../../../lib/theme';

// Copy exacto: brand/copies.md → "Notificaciones (bandeja)".
const TITLE = 'Notificaciones';
const EMPTY_STATE = 'Aún no tienes notificaciones. ¡Empieza a explorar!';

// Marcar-todas-como-leídas ocurre dentro de `useNotifications` (en cada
// carga: mount, foco de vuelta, pull-to-refresh) — la screen solo
// coordina render, no dispara la marca por su cuenta. Ver comentario en
// el hook.
export function NotificationsScreen() {
  const router = useRouter();
  const { notifications, isLoading, isRefreshing, isLoadingMore, error, refresh, loadMore, markRead } =
    useNotifications();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Esta pantalla vive como Stack.Screen hermana de "(tabs)" (ver
          app/(app)/_layout.tsx) con headerShown: false a nivel del Stack —
          sin header nativo, sin este botón no hay forma de salir salvo el
          gesto/botón físico de atrás del sistema. Bug real reportado: la
          pantalla se quedaba "ciclada" sin salida. Mismo patrón que
          ConversationScreen.tsx / NotificationPreferencesScreen.tsx. */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{TITLE}</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem notification={item} onRead={markRead} />}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.purple} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            isLoadingMore ? <ActivityIndicator color={colors.purple} style={styles.footerLoader} /> : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{EMPTY_STATE}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.small,
    color: colors.rose,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    marginVertical: spacing.lg,
  },
});
