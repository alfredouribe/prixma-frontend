import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EventCategoryFilter } from '../components/EventCategoryFilter';
import { eventDetailRoute } from '../utils/eventRoute';
import { colors, spacing, surfaces, text, typography } from '../../../lib/theme';
import type { Event } from '../types/event.types';

// COPY PENDIENTE: brand/copies.md → "Eventos" no define un estado vacío de
// lista (sin eventos con el filtro actual). Mismo criterio ya usado en
// features/chat/screens/ConversationsScreen.tsx para "Solicitudes" — se deja
// un marcador visible en vez de inventar texto, pendiente de aprobación.
const EMPTY_EVENTS = '[COPY PENDIENTE: estado vacío — sin eventos]';

// Copy exacto: brand/copies.md → "Eventos".
export function EventsScreen() {
  const router = useRouter();
  const {
    events,
    filter,
    changeFilter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    updateEvent,
  } = useEvents();

  function handlePressEvent(event: Event) {
    router.push(eventDetailRoute(event.id));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Eventos</Text>

      <EventCategoryFilter value={filter} onChange={changeFilter} />

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
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={handlePressEvent} onChanged={updateEvent} />
          )}
          contentContainerStyle={events.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.purple} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color={colors.purple} style={styles.footerLoader} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{EMPTY_EVENTS}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Nota fija al fondo — copy exacto: brand/copies.md → "Eventos" → "Nota de pagos". */}
      <View style={styles.paymentsNote}>
        <Text style={styles.paymentsNoteText}>
          Las compras de boletos se realizan en el sitio del organizador. Prixma no procesa pagos de eventos.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
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
  paymentsNote: {
    borderTopWidth: 0.5,
    borderTopColor: surfaces.border,
    backgroundColor: surfaces.elevated,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  paymentsNoteText: {
    ...typography.caption,
    color: text.tertiary,
    textAlign: 'center',
  },
});
