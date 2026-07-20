import { useLocalSearchParams } from 'expo-router';
import { PublicProfileScreen } from '../../../src/features/profile/screens/PublicProfileScreen';

export default function PublicProfileRoute() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  return <PublicProfileScreen uuid={uuid} />;
}
