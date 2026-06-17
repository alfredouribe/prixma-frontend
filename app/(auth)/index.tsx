import { useState } from 'react';
import { IntroScreen } from '../../src/features/auth/screens/IntroScreen';
import { SplashScreen } from '../../src/features/auth/screens/SplashScreen';

export default function SplashRoute() {
  const [introDone, setIntroDone] = useState(false);

  if (!introDone) {
    return <IntroScreen onDone={() => setIntroDone(true)} />;
  }

  return <SplashScreen />;
}
