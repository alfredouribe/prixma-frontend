import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { EventAttendees } from './EventAttendees';
import { EventRsvpControl } from './EventRsvpControl';
import { formatEventDateBadge, formatEventTime } from '../utils/formatEventDate';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../utils/eventCategoryMeta';
import type { Event } from '../types/event.types';

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onChanged: (updated: Event) => void;
}

export function EventCard({ event, onPress, onChanged }: EventCardProps) {
  const badge = formatEventDateBadge(event.event_date);

  return (
    <View style={styles.card} testID={`event-card-${event.id}`}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(event)}>
        <View style={styles.imageWrap}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.emoji}>{CATEGORY_EMOJI[event.category]}</Text>
            </View>
          )}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{badge.day}</Text>
            <Text style={styles.dateBadgeMonth}>{badge.month}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{CATEGORY_LABELS[event.category]}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={text.tertiary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location_name}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={text.tertiary} />
            <Text style={styles.metaText}>{formatEventTime(event.event_date)}</Text>
          </View>

          <EventAttendees interestedCount={event.interested_count} goingCount={event.going_count} />
        </View>
      </TouchableOpacity>

      <View style={styles.rsvpWrap}>
        <EventRsvpControl eventId={event.id} status={event.my_rsvp_status} onChanged={onChanged} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: surfaces.card,
    borderWidth: 0.5,
    borderColor: surfaces.border,
    borderRadius: radius.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: surfaces.elevated,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  dateBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(13,13,20,0.75)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 44,
  },
  dateBadgeDay: {
    ...typography.h3,
    color: colors.white,
    lineHeight: 20,
  },
  dateBadgeMonth: {
    ...typography.caption,
    color: colors.white,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  category: {
    ...typography.label,
    color: colors.purple,
  },
  title: {
    ...typography.h3,
    color: text.primary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.small,
    color: text.secondary,
    flexShrink: 1,
  },
  rsvpWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
});
