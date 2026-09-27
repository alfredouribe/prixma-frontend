import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import api from '../../../lib/api';
import { colors, surfaces, text, spacing, radius, typography } from '../../../lib/theme';

/**
 * Pantalla temporal de diagnóstico — no es parte del producto, existe solo
 * para depurar el problema real de conectividad entre la app instalada
 * (build de producción vía Play Store) y el backend del VPS, sin tener que
 * adivinar a través del flujo real de login/registro. Quitar del build una
 * vez resuelto y confirmado en dispositivo real. Ver conversación 2026-09-23.
 */

type CheckResult = {
  label: string;
  ok: boolean;
  detail: string;
};

export function DebugScreen() {
  const router = useRouter();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const envInfo = [
    { key: 'EXPO_PUBLIC_API_URL', value: process.env.EXPO_PUBLIC_API_URL ?? '(vacío)' },
    { key: 'EXPO_PUBLIC_WS_URL', value: process.env.EXPO_PUBLIC_WS_URL ?? '(vacío)' },
    { key: 'EXPO_PUBLIC_REVERB_HOST', value: process.env.EXPO_PUBLIC_REVERB_HOST ?? '(vacío)' },
    { key: 'EXPO_PUBLIC_REVERB_PORT', value: process.env.EXPO_PUBLIC_REVERB_PORT ?? '(vacío)' },
    { key: 'EXPO_PUBLIC_REVERB_SCHEME', value: process.env.EXPO_PUBLIC_REVERB_SCHEME ?? '(vacío)' },
  ];

  async function runChecks() {
    setIsRunning(true);
    const next: CheckResult[] = [];

    try {
      const res = await api.get('/health', { timeout: 15000 });
      next.push({
        label: 'GET /health (cliente Axios central)',
        ok: true,
        detail: `${res.status} — ${JSON.stringify(res.data)}`,
      });
    } catch (err: unknown) {
      next.push({
        label: 'GET /health (cliente Axios central)',
        ok: false,
        detail: describeError(err),
      });
    }

    try {
      const url = `${process.env.EXPO_PUBLIC_API_URL}/health`;
      const start = Date.now();
      const res = await fetch(url);
      const body = await res.text();
      next.push({
        label: 'fetch() nativo directo (sin Axios/interceptores)',
        ok: res.ok,
        detail: `${res.status} en ${Date.now() - start}ms — ${body.slice(0, 200)}`,
      });
    } catch (err: unknown) {
      next.push({
        label: 'fetch() nativo directo (sin Axios/interceptores)',
        ok: false,
        detail: describeError(err),
      });
    }

    setResults(next);
    setIsRunning(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Diagnóstico de conexión</Text>
        <Text style={styles.subtitle}>
          Pantalla temporal, no es parte del producto — solo para depurar la conexión con el
          backend.
        </Text>

        <Text style={styles.sectionTitle}>Configuración horneada en este build</Text>
        <View style={styles.card}>
          {envInfo.map((row) => (
            <View key={row.key} style={styles.envRow}>
              <Text style={styles.envKey}>{row.key}</Text>
              <Text style={styles.envValue} selectable>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={runChecks} disabled={isRunning}>
          <Text style={styles.buttonText}>
            {isRunning ? 'Probando...' : 'Probar conexión con el backend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.sentryButton]}
          onPress={() => Sentry.captureException(new Error('Prueba manual desde Diagnóstico de conexión'))}
        >
          <Text style={styles.buttonText}>Probar Sentry (evento de prueba)</Text>
        </TouchableOpacity>

        {results.map((r) => (
          <View
            key={r.label}
            style={[styles.card, r.ok ? styles.cardOk : styles.cardError]}
          >
            <Text style={styles.resultLabel}>
              {r.ok ? '✅' : '❌'} {r.label}
            </Text>
            <Text style={styles.resultDetail} selectable>
              {r.detail}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function describeError(err: unknown): string {
  const e = err as {
    message?: string;
    code?: string;
    name?: string;
    response?: { status?: number; data?: unknown };
  };
  const parts = [
    e.name && `name: ${e.name}`,
    e.code && `code: ${e.code}`,
    e.message && `message: ${e.message}`,
    e.response?.status && `http status: ${e.response.status}`,
    e.response?.data !== undefined && `body: ${JSON.stringify(e.response.data)}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join('\n') : String(err);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surfaces.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.small,
    color: text.secondary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: text.secondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: surfaces.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surfaces.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardOk: {
    borderColor: colors.green,
  },
  cardError: {
    borderColor: colors.rose,
  },
  envRow: {
    marginBottom: spacing.sm,
  },
  envKey: {
    ...typography.caption,
    color: text.secondary,
  },
  envValue: {
    ...typography.small,
    color: text.primary,
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  sentryButton: {
    backgroundColor: colors.rose,
  },
  resultLabel: {
    ...typography.small,
    color: text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'PoppinsRounded-SemiBold',
  },
  resultDetail: {
    ...typography.caption,
    color: text.secondary,
  },
});
