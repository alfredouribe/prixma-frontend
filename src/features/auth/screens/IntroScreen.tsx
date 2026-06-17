import { useEffect, useRef } from "react";
import { View, Image, Animated, Easing, StyleSheet } from "react-native";
import { brandAssets } from "../../../lib/brandAssets";
import {
  colors,
  surfaces,
  text,
  spacing,
  radius,
  typography,
} from "../../../lib/theme";

const LOGO_SIZE = 112;
const SECTION_SIZE = Math.round(LOGO_SIZE * 2.5); // 280 — fits ring at max scale 2.2×
const RING_OFFSET = (SECTION_SIZE - LOGO_SIZE) / 2; // 84

export function IntroScreen({ onDone }: { onDone: () => void }) {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring1Progress = useRef(new Animated.Value(0)).current;
  const ring2Progress = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(14)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  const ring1AnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const ring2AnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Logo: pop in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Rings: expand and fade out in a loop
    const makeRingLoop = (value: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    ring1AnimRef.current = makeRingLoop(ring1Progress);
    ring1AnimRef.current.start();

    const ring2Timer = setTimeout(() => {
      ring2AnimRef.current = makeRingLoop(ring2Progress);
      ring2AnimRef.current.start();
    }, 1100);

    // Text: rise in with staggered delays
    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);

    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 550);

    const t3 = setTimeout(() => {
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Screen: fade out then hand off
    const fadeTimer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onDone());
    }, 2200);

    return () => {
      clearTimeout(ring2Timer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      ring1AnimRef.current?.stop();
      ring2AnimRef.current?.stop();
    };
  }, []);

  const ringStyle = (progress: Animated.Value) => ({
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 2.2],
        }),
      },
    ],
    opacity: progress.interpolate({
      inputRange: [0, 0.05, 1],
      outputRange: [0, 0.6, 0],
    }),
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.logoSection}>
        <Animated.View style={[styles.ring, ringStyle(ring1Progress)]} />
        <Animated.View style={[styles.ring, ringStyle(ring2Progress)]} />
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <Image
            source={brandAssets.logo.white}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        Prixma
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] },
        ]}
      >
        Conecta siendo tú
      </Animated.Text>

      <Animated.View style={[styles.dots, { opacity: dotsOpacity }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoSection: {
    width: SECTION_SIZE,
    height: SECTION_SIZE,
    marginBottom: spacing.xl,
  },
  ring: {
    position: "absolute",
    top: RING_OFFSET,
    left: RING_OFFSET,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.purple,
  },
  logoContainer: {
    position: "absolute",
    top: RING_OFFSET,
    left: RING_OFFSET,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 42,
    lineHeight: 52,
    color: colors.purple,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
  },
  dots: {
    position: "absolute",
    bottom: 56,
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
    opacity: 0.8,
  },
});
