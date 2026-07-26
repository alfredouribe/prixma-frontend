import { useLocalSearchParams } from 'expo-router';
import { EventDetailScreen } from '../../../src/features/events/screens/EventDetailScreen';

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EventDetailScreen eventId={id} />;
}
