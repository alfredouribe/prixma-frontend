import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEventDetail } from '../hooks/useEventDetail';
import { EventAttendees } from '../components/EventAttendees';
import { EventRsvpControl } from '../components/EventRsvpControl';
import { formatEventDateTime } from '../utils/formatEventDate';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../utils/eventCategoryMeta';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';

interface EventDetailScreenProps {
  eventId: string;
}

// Copy exacto: brand/copies.md → "Eventos".
export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const { event, isLoading, error, reload, updateEvent } = useEventDetail(eventId);

  // Link externo — siempre abre en el navegador del dispositivo, nunca en
  // un WebView interno (ver spec.md → "Constraints": "Links externos abren
  // en el navegador del dispositivo").
  function handleOpenExternalLink() {
    if (event?.external_link) {
      Linking.openURL(event.external_link);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.purple} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>
          {error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={reload} activeOpacity={0.8}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
        accessibilityLabel="Cerrar"
      >
        <Ionicons name="close" size={20} color={colors.white} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageWrap}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.emoji}>{CATEGORY_EMOJI[event.category]}</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{CATEGORY_LABELS[event.category]}</Text>
            <Text style={styles.dateText}>{formatEventDateTime(event.event_date)}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={text.secondary} />
            <Text style={styles.metaText}>{event.location_name}</Text>
          </View>

          <EventAttendees interestedCount={event.interested_count} goingCount={event.going_count} />

          <Text style={styles.description}>{event.description}</Text>

          {event.external_link && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleOpenExternalLink}
              activeOpacity={0.85}
              testID="event-external-link"
            >
              <Text style={styles.linkButtonText}>🎟 Comprar boletos →</Text>
            </TouchableOpacity>
          )}

          <View style={styles.rsvpSection}>
            <EventRsvpControl eventId={event.id} status={event.my_rsvp_status} onChanged={updateEvent} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: surfaces.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  centered: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  retryText: { ...typography.button, color: colors.white },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.xl,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: surfaces.elevated,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    ...typography.label,
    color: colors.purple,
  },
  dateText: {
    ...typography.small,
    color: text.secondary,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
    color: text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.body,
    color: text.secondary,
    flexShrink: 1,
  },
  description: {
    ...typography.body,
    color: text.secondary,
    lineHeight: 22,
  },
  linkButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    ...typography.button,
    color: colors.white,
  },
  rsvpSection: {
    marginTop: spacing.sm,
  },
});
