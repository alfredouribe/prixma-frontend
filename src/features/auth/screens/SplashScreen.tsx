import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
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
import { brandAssets } from "../../../lib/brandAssets";

export function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoGlow}>
          <Image
            source={brandAssets.logo.color}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>Prixma</Text>
        <Text style={styles.tagline}>
          Conexiones reales, sin pedir permiso.
        </Text>

        <View style={styles.pills}>
          {["Identidades verificadas", "Sé tú misme", "Espacio seguro"].map(
            (pill) => (
              <View key={pill} style={styles.pill}>
                <Text style={styles.pillText}>{pill}</Text>
              </View>
            ),
          )}
        </View>

        <Text style={styles.socialProof}>+12,000 personas ya están aquí</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Quiero crear mi perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 36,
    lineHeight: 44,
    color: colors.purple,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.purple,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.purple}18`,
  },
  pillText: {
    ...typography.small,
    color: colors.purple,
    fontFamily: "PoppinsRounded-Medium",
  },
  socialProof: {
    ...typography.small,
    color: text.tertiary,
    textAlign: "center",
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.purple,
  },
});
