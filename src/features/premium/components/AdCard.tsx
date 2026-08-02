import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { useSwipeGesture } from '../../matching/hooks/useSwipeGesture';

// COPY PENDIENTE: brand/copies.md no define copy promocional para la card
// de ads de Explorar todavía — mismo criterio de placeholder ya usado en
// EventsScreen.tsx / RequestModal.tsx (ver esos archivos). El botón sí usa
// copy ya aprobado ("Actualiza tu plan", brand/copies.md → "Mi perfil" →
// Opciones de configuración → Premium).
const TITLE_PLACEHOLDER = '[COPY PENDIENTE: título promocional de Prixma+]';
const SUBTITLE_PLACEHOLDER = '[COPY PENDIENTE: subtítulo promocional de Prixma+]';

interface AdCardProps {
  onDismiss: () => void;
}

/**
 * Card de publicidad propia de Prixma (nunca de un ad network de terceros,
 * ver features/premium/specs/spec.md) intercalada en la cola de Explorar
 * por `useExploreQueue`. Comparte el gesto de swipe con `ProfileCard` vía
 * `useSwipeGesture` para que se sienta idéntica, pero cualquier dirección
 * simplemente descarta la card (`onDismiss`) — nunca llama a
 * `matchingService.swipe()`, no cuenta como swipe real para el backend.
 */
export function AdCard({ onDismiss }: AdCardProps) {
  const { pan, cardStyle } = useSwipeGesture(() => onDismiss());

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]} testID="ad-card">
        <View style={styles.content}>
          <Text style={styles.brand}>Prixma+</Text>
          <Text style={styles.title}>{TITLE_PLACEHOLDER}</Text>
          <Text style={styles.subtitle}>{SUBTITLE_PLACEHOLDER}</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Actualiza tu plan</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.purple,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  brand: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 24,
    color: colors.purple,
    letterSpacing: 1,
  },
  title: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ctaText: {
    ...typography.button,
    color: colors.white,
  },
});
