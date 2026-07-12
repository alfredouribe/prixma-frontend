import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileSettings } from '../hooks/useProfileSettings';
import { SafetyToggle } from '../../../components/SafetyToggle';
import { colors, surfaces, text, typography, spacing, radius } from '../../../lib/theme';
import type { ProfileSettings } from '../types/profile.types';

const TOGGLES: Array<{
  key: keyof Omit<ProfileSettings, 'id'>;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    key: 'notify_matches_enabled',
    icon: '💜',
    label: 'Matches',
    description: 'Cuando alguien se guste contigo',
  },
  {
    key: 'notify_messages_enabled',
    icon: '💬',
    label: 'Mensajes',
    description: 'Cuando recibes un mensaje nuevo',
  },
  {
    key: 'notify_events_enabled',
    icon: '📅',
    label: 'Eventos',
    description: 'Recordatorios y novedades de eventos cerca de ti',
  },
];

export function NotificationsScreen() {
  const router = useRouter();
  const { settings, isLoading, error, toggle, reload } = useProfileSettings();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>Notificaciones</Text>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      )}

      {!isLoading && (error || !settings) && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error ?? 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload} activeOpacity={0.8}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && settings && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleList}>
            {TOGGLES.map((t) => (
              <SafetyToggle
                key={t.key}
                icon={t.icon}
                label={t.label}
                description={t.description}
                value={settings[t.key]}
                onToggle={() => toggle(t.key)}
              />
            ))}
          </View>

          {error && <Text style={styles.inlineErrorText}>{error}</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  toggleList: { gap: spacing.md },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  errorText: { ...typography.body, color: text.secondary, textAlign: 'center' },
  inlineErrorText: { ...typography.small, color: colors.rose, marginTop: spacing.lg },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
  },
  retryText: { ...typography.button, color: colors.white },
});
