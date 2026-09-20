import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, surfaces, text, typography } from '../../../lib/theme';
import { MatchOverlay } from '../../matching/components/MatchOverlay';
import { useMyProfile } from '../../profile/hooks/useMyProfile';
import { usePurchasePrixmaPlus } from '../../subscriptions/hooks/usePurchasePrixmaPlus';
import { LikerCard } from '../components/LikerCard';
import { useLikers } from '../hooks/useLikers';

// Copy borrador (2026-08-18, Mafer de vacaciones — ver brand/copies.md →
// "Borradores pendientes de revisión" para el detalle y la condición de
// revisión cuando regrese). El botón "Actualiza tu plan" sí es copy ya
// aprobado (brand/copies.md → "Mi perfil" → Opciones de configuración →
// Premium).
const SCREEN_TITLE = 'Te dieron like';
const PAYWALL_TITLE = 'Descubre quién te dio like';
const PAYWALL_SUBTITLE = 'Con Prixma+ ves a todas las personas que ya se fijaron en ti.';
const EMPTY_STATE = 'Todavía nadie te ha dado like — sigue explorando.';
const BACK_LABEL = 'Volver';

/**
 * Ver quién te dio like — lista/grid de perfiles que dieron like/super_like
 * al usuario, sin necesidad de match previo. Tres estados: cargando,
 * paywall (sin acceso — 403 del backend), o la lista. Dar like de vuelta
 * genera match instantáneo (el like inverso ya existe) — se reusa
 * `MatchOverlay` para celebrarlo, mismo componente y flujo que
 * `ExploreScreen.tsx`, en vez de inventar una pantalla de match distinta.
 * Ver features/premium/specs/spec.md → "Ver quién te dio like".
 */
export function WhoLikedMeScreen() {
  const router = useRouter();
  const { profile: myProfile } = useMyProfile();
  const {
    likers,
    isLoading,
    needsUpgrade,
    error,
    refresh,
    likeBack,
    likingProfileId,
    likeError,
    matchResult,
    dismissMatch,
  } = useLikers();
  const { purchase, isPurchasing, error: purchaseError } = usePurchasePrixmaPlus();

  // Mismo patrón ya usado en ExploreScreen.tsx para el error de rewind —
  // Alert con el mensaje del servidor, vía efecto.
  useEffect(() => {
    if (error) {
      Alert.alert('', error);
    }
  }, [error]);

  useEffect(() => {
    if (likeError) {
      Alert.alert('', likeError);
    }
  }, [likeError]);

  useEffect(() => {
    if (purchaseError) {
      Alert.alert('', purchaseError);
    }
  }, [purchaseError]);

  // Tras una compra exitosa, se vuelve a pedir /matching/likers para que
  // `needsUpgrade` se re-evalúe con el estado real de RevenueCat/backend —
  // ver features/subscriptions/specs/plan.md → "Compra real desde los
  // paywalls existentes".
  async function handleUpgrade() {
    const success = await purchase();
    if (success) {
      refresh();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel={BACK_LABEL}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={text.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {SCREEN_TITLE}
        </Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      ) : needsUpgrade ? (
        <View style={styles.centered}>
          <View style={styles.paywallCard} testID="likers-paywall">
            <Text style={styles.paywallBrand}>Prixma+</Text>
            <Text style={styles.paywallTitle}>{PAYWALL_TITLE}</Text>
            <Text style={styles.paywallSubtitle}>{PAYWALL_SUBTITLE}</Text>
            <TouchableOpacity
              style={styles.upgradeBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={handleUpgrade}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.upgradeBtnText}>Actualiza tu plan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : likers.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{EMPTY_STATE}</Text>
        </View>
      ) : (
        <FlatList
          data={likers}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <LikerCard profile={item} onLike={likeBack} isLiking={likingProfileId === item.id} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="likers-list"
        />
      )}

      {matchResult && (
        <MatchOverlay
          visible={true}
          myPhoto={myProfile?.photo_url ?? null}
          otherProfile={matchResult.otherProfile}
          onSendMessage={() => {
            dismissMatch();
            router.push('/(app)/(tabs)/chats');
          }}
          onKeepExploring={dismissMatch}
          onViewFull={() => {
            const otherProfile = matchResult.otherProfile;
            dismissMatch();
            router.push({
              pathname: '/(app)/match/[id]',
              params: {
                id: matchResult.matchId,
                name: otherProfile.display_name,
                photo: otherProfile.photos[0]?.url ?? '',
                myPhoto: myProfile?.photo_url ?? '',
              },
            });
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: surfaces.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: surfaces.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: text.primary,
    flex: 1,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  paywallCard: {
    width: '100%',
    backgroundColor: surfaces.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.purple,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  paywallBrand: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 24,
    color: colors.purple,
    letterSpacing: 1,
  },
  paywallTitle: {
    ...typography.h2,
    color: text.primary,
    textAlign: 'center',
  },
  paywallSubtitle: {
    ...typography.body,
    color: text.secondary,
    textAlign: 'center',
  },
  upgradeBtn: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.purple,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  upgradeBtnText: {
    ...typography.button,
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
