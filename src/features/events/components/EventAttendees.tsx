import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, text, typography } from '../../../lib/theme';

interface EventAttendeesProps {
  interestedCount: number;
  goingCount: number;
}

/**
 * `EventResource` (backend) solo expone contadores — `interested_count`/
 * `going_count`, nunca avatares ni la identidad de los asistentes (y nunca
 * `not_going_count`, ver spec.md → "Estados de asistencia"). Este componente
 * muestra solo los números; no inventa avatares que la API no da (ver
 * features/events/specs/tasks.md → FRONTEND, nota sobre `EventAttendees`).
 */
export function EventAttendees({ interestedCount, goingCount }: EventAttendeesProps) {
  return (
    <View style={styles.row} testID="event-attendees">
      <View style={styles.item} testID="event-attendees-going">
        <Ionicons name="checkmark-circle" size={14} color={text.secondary} />
        <Text style={styles.count}>{goingCount}</Text>
      </View>
      <View style={styles.item} testID="event-attendees-interested">
        <Ionicons name="star" size={14} color={text.secondary} />
        <Text style={styles.count}>{interestedCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  count: {
    ...typography.caption,
    color: text.secondary,
  },
});
