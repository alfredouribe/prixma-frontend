import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { EditProfileScreen } from '../../../src/features/profile/screens/EditProfileScreen';
import { profileService } from '../../../src/features/profile/services/profileService';
import { colors, surfaces } from '../../../src/lib/theme';
import type { MyProfile } from '../../../src/features/profile/types/profile.types';

export default function EditRoute() {
  const [profile, setProfile] = useState<MyProfile | null>(null);

  useEffect(() => {
    profileService.getMyProfile().then(setProfile).catch(() => {});
  }, []);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} size="large" />
      </View>
    );
  }

  return <EditProfileScreen profile={profile} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: surfaces.bg, alignItems: 'center', justifyContent: 'center' },
});
