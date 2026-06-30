import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  colors,
  surfaces,
  text,
  spacing,
  radius,
  typography,
} from "../../../lib/theme";


export function SplashScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@assets/images/splash-screen.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.top}>
          <Text style={styles.tagline}>
            Conexiones reales,{"\n"}
            <Text style={styles.taglineAccent}>Sin pedir permiso.</Text>
          </Text>

          <Text style={styles.featureItem}>Identidades verificadas</Text>
          <Text style={styles.featureItem}>Sé tú misme</Text>
          <Text style={styles.featureItem}>Espacio seguro</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Quiero crear mi perfil</Text>
          </TouchableOpacity>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginRow}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.loginLink}>Ya tengo cuenta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: surfaces.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 13, 20, 0.4)",
  },
  container: {
    flex: 1,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  tagline: {
    fontFamily: "PoppinsRounded-Bold",
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  taglineAccent: {
    color: colors.rose,
  },
  featureItem: {
    ...typography.small,
    color: text.secondary,
    marginTop: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.3,
  },
  dotActive: {
    backgroundColor: colors.purple,
    opacity: 1,
  },
  loginRow: {
    ...typography.small,
    color: text.secondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  loginLink: {
    color: colors.purple,
    fontFamily: "PoppinsRounded-Medium",
  },
});
