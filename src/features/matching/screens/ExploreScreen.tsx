import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/authStore';
import { useMyProfile } from '../../profile/hooks/useMyProfile';
import { NotificationBell } from '../../notifications/components/NotificationBell';
import { AdCard } from '../../premium/components/AdCard';
import { LikeLimitPaywall } from '../../premium/components/LikeLimitPaywall';
import { usePremiumSettings } from '../../premium/hooks/usePremiumSettings';
import { CardActions } from '../components/CardActions';
import { EmptyExplore } from '../components/EmptyExplore';
import { FilterSheet } from '../components/FilterSheet';
import { MatchOverlay } from '../components/MatchOverlay';
import { ProfileCard } from '../components/ProfileCard';
import { useExploreQueue } from '../hooks/useExploreQueue';
import { useMatchingPreferences } from '../hooks/useMatchingPreferences';
import { useSwipe } from '../hooks/useSwipe';
import type { SwipeDirection } from '../types/matching.types';

export function ExploreScreen() {
  const router = useRouter();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const intention = useAuthStore((s) => s.user?.intention ?? null);
  const { profile: myProfile } = useMyProfile();
  const { settings, isLoading: isSettingsLoading } = usePremiumSettings();

  // Esperar a que carguen los ajustes de Premium antes de mostrar la
  // primera card: así `adInterval` ya está resuelto (número real o `null`)
  // desde el primer render con perfiles, evitando que las ads "salten" de
  // posición si `settings` llegara después de que el usuario ya avanzó.
  const { currentItem, currentIndex, isEmpty, isLoading, advance, refresh } = useExploreQueue({
    isPremium: settings?.is_premium ?? false,
    adInterval: settings?.free_swipes_per_ad ?? null,
  });
  const { preferences, updatePreferences } = useMatchingPreferences();

  const {
    swipe,
    matchResult,
    isSwiping,
    dismissMatch,
    failedSwipeToken,
    showLikeLimitPaywall,
    dismissLikeLimitPaywall,
  } = useSwipe({
    onSwipeComplete: advance,
  });

  const showLoading = isLoading || isSettingsLoading;
  const isAd = currentItem?.kind === 'ad';
  const currentProfile = currentItem?.kind === 'profile' ? currentItem.profile : null;

  function handleAction(direction: SwipeDirection) {
    if (isAd) {
      advance();
      return;
    }
    if (currentProfile) {
      swipe(currentProfile, direction);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — visible en los 3 estados (cargando, cola vacía, con
          perfil). Antes solo vivía dentro de la rama "con perfil": si la
          cola estaba vacía o todavía cargando, el usuario perdía acceso a
          filtros (y ahora también a notificaciones) hasta que apareciera
          un perfil. Ver features/notifications/specs/tasks.md → nota de
          bug UX a evitar. */}
      <View style={styles.header}>
        <Text style={styles.logo}>prixma</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setFiltersVisible(true)}
            accessibilityLabel="Abrir filtros"
            accessibilityRole="button"
          >
            <Ionicons name="options-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <NotificationBell />
        </View>
      </View>

      {showLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9b5dff" />
        </View>
      ) : isEmpty || !currentItem ? (
        <EmptyExplore onOpenFilters={() => setFiltersVisible(true)} />
      ) : (
        <>
          {/* Card */}
          <View style={styles.cardContainer}>
            {isAd ? (
              <AdCard key={`ad-${currentIndex}`} onDismiss={advance} />
            ) : currentProfile ? (
              <ProfileCard
                key={`${currentProfile.id}-${failedSwipeToken}`}
                profile={currentProfile}
                onSwipe={(direction) => swipe(currentProfile, direction)}
              />
            ) : null}
          </View>

          {/* Actions */}
          <CardActions
            intention={intention}
            onSkip={() => handleAction('dislike')}
            onLike={() => handleAction('like')}
            onSuperLike={() => handleAction('super_like')}
            hasVideo={!isAd && (currentProfile?.has_video ?? false)}
            disabled={isSwiping}
          />
        </>
      )}

      {/* Match Overlay — fuera del ternario de arriba a propósito: el swipe
          que completa un match puede ser también el que agota la cola local
          (`advance()` marca `isEmpty` en el mismo tick en que llega
          `matchResult`), y antes este overlay vivía anidado dentro de la
          rama "cola no vacía" — la pantalla saltaba directo a "no hay más
          perfiles" y el match nunca se veía, aunque sí quedara registrado en
          el backend (conversación creada, visible en Chats). Bug real
          reportado por el humano 2026-08-03. `matchResult` es independiente
          de qué esté pintado en el área de la card, así que debe poder
          mostrarse encima de cualquiera de los 3 estados (cargando, vacío,
          con card). */}
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

      {/* Filter Sheet — shared across empty and normal states */}
      {preferences && (
        <FilterSheet
          visible={filtersVisible}
          preferences={preferences}
          onApply={async (prefs) => {
            await updatePreferences(prefs);
            refresh();
          }}
          onClose={() => setFiltersVisible(false)}
        />
      )}

      <LikeLimitPaywall visible={showLikeLimitPaywall} onClose={dismissLikeLimitPaywall} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d14',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontFamily: 'PoppinsRounded-Bold',
    fontSize: 22,
    color: '#9b5dff',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
