import { TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MyProfileScreen } from '../../../src/features/profile/screens/MyProfileScreen';
import { colors, surfaces } from '../../../src/lib/theme';

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mi perfil',
          headerStyle: { backgroundColor: surfaces.bg },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontFamily: 'PoppinsRounded-SemiBold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile/edit')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={22} color={colors.purple} />
            </TouchableOpacity>
          ),
        }}
      />
      <MyProfileScreen />
    </>
  );
}
