import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PoppinsRounded-Regular':  require('../brand/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'PoppinsRounded-Medium':   require('../brand/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'PoppinsRounded-SemiBold': require('../brand/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'PoppinsRounded-Bold':     require('../brand/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
