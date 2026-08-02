import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing, text, typography } from '../../../lib/theme';
import type { IncomingMessageToast } from '../hooks/useIncomingMessageToast';

interface MessageToastProps {
  toast: IncomingMessageToast | null;
  onPress: () => void;
  onDismiss: () => void;
}

const ANIMATION_DURATION = 250;
const HIDDEN_OFFSET = -40;

/**
 * Toast in-app tipo iOS (blur) para un mensaje nuevo mientras se usa la
 * app — nunca el banner nativo del sistema. Montado una sola vez en
 * app/(app)/_layout.tsx, controlado por useIncomingMessageToast. Ver
 * features/chat/specs/plan.md → "Toast in-app de mensaje nuevo".
 *
 * `content` se queda con el último toast no-nulo a propósito: cuando
 * `toast` pasa a null (auto-dismiss o tap), la animación de salida
 * necesita seguir mostrando el texto mientras se desvanece — solo se
 * "limpia" de facto al desmontarse (nunca vuelve a null en pantalla).
 *
 * Posicionamiento del safe-area top: se usa el componente `SafeAreaView`
 * (no el hook `useSafeAreaInsets`) — mismo patrón ya establecido en
 * `ConversationScreen.tsx`/`VideoCard.tsx`. El hook exige un
 * `<SafeAreaProvider>` ancestro (que este proyecto no monta en
 * app/_layout.tsx) y lanza en tiempo de ejecución sin él; el componente
 * `SafeAreaView` no tiene esa dependencia — lee el frame nativo
 * directamente.
 */
export function MessageToast({ toast, onPress, onDismiss }: MessageToastProps) {
  const visible = toast !== null;
  const [content, setContent] = useState<IncomingMessageToast | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(HIDDEN_OFFSET);

  useEffect(() => {
    if (toast) {
      setContent(toast);
    }
    opacity.value = withTiming(visible ? 1 : 0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(visible ? 0 : HIDDEN_OFFSET, { duration: ANIMATION_DURATION });
  }, [toast, visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!content) return null;

  return (
    <View style={styles.overlay} pointerEvents={visible ? 'box-none' : 'none'} testID="message-toast">
      <SafeAreaView edges={['top']} pointerEvents="box-none">
        <Animated.View style={[styles.wrapper, animatedStyle]}>
          <TouchableOpacity activeOpacity={0.85} onPress={onPress} testID="message-toast-press">
            <BlurView intensity={80} tint="dark" style={styles.blur}>
              {content.senderPhoto ? (
                <Image source={{ uri: content.senderPhoto }} style={styles.avatar} testID="message-toast-avatar" />
              ) : (
                <View style={styles.iconWrap}>
                  <Ionicons name="chatbubble" size={18} color={colors.blue} />
                </View>
              )}

              <View style={styles.body}>
                <Text style={styles.sender} numberOfLines={1}>
                  {content.senderName}
                </Text>
                <Text style={styles.preview} numberOfLines={2}>
                  {content.preview}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onDismiss}
                hitSlop={8}
                style={styles.closeBtn}
                accessibilityLabel="Cerrar"
                testID="message-toast-dismiss"
              >
                <Ionicons name="close" size={16} color={text.tertiary} />
              </TouchableOpacity>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  wrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  blur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    // El blur nativo por sí solo se veía demasiado transparente (reportado
    // por el humano) — se agrega un tinte oscuro semitransparente encima
    // (80% opaco / 20% transparente, mismo tono que colors.dark) para que
    // el texto se lea bien sin perder el efecto de blur detrás.
    backgroundColor: 'rgba(13, 13, 20, 0.8)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: `${colors.blue}26`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  sender: {
    ...typography.h3,
    fontSize: 14,
    color: text.primary,
  },
  preview: {
    ...typography.small,
    color: text.secondary,
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
