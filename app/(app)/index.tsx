import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../src/features/auth/hooks/useLogout';
import { surfaces, text, typography, spacing, colors } from '../../src/lib/theme';

export default function HomeRoute() {
  const { handleLogout, isLoading } = useLogout();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Prixma</Text>
        <Text style={styles.subtitle}>Próximamente: explorar perfiles</Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.purple} size="small" />
        ) : (
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  logoutButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    ...typography.button,
    color: colors.purple,
  },
});
