import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/authStore';
import { useMyProfile } from '../../profile/hooks/useMyProfile';
import { UnreadBadge } from '../../notifications/components/UnreadBadge';
import { useUnreadCount } from '../../notifications/hooks/useUnreadCount';
import { CardActions } from '../components/CardActions';
import { EmptyExplore } from '../components/EmptyExplore';
import { FilterSheet } from '../components/FilterSheet';
import { MatchOverlay } from '../components/MatchOverlay';
import { ProfileCard } from '../components/ProfileCard';
import { useExploreQueue } from '../hooks/useExploreQueue';
import { useMatchingPreferences } from '../hooks/useMatchingPreferences';
import { useSwipe } from '../hooks/useSwipe';

export function ExploreScreen() {
  const router = useRouter();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const intention = useAuthStore((s) => s.user?.intention ?? null);
  const { profile: myProfile } = useMyProfile();

  const { currentProfile, isEmpty, isLoading, advance, refresh } = useExploreQueue();
  const { preferences, updatePreferences } = useMatchingPreferences();
  const { count: unreadCount } = useUnreadCount();

  const { swipe, matchResult, isSwiping, dismissMatch } = useSwipe({
    onSwipeComplete: advance,
  });

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
          <TouchableOpacity
            onPress={() => router.push('/(app)/notifications')}
            accessibilityLabel="Notificaciones"
            accessibilityRole="button"
            style={styles.bellButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
            <UnreadBadge count={unreadCount} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9b5dff" />
        </View>
      ) : isEmpty || !currentProfile ? (
        <EmptyExplore onOpenFilters={() => setFiltersVisible(true)} />
      ) : (
        <>
          {/* Card */}
          <View style={styles.cardContainer}>
            <ProfileCard
              key={currentProfile.id}
              profile={currentProfile}
              onSwipe={(direction) => swipe(currentProfile, direction)}
            />
          </View>

          {/* Actions */}
          <CardActions
            intention={intention}
            onSkip={() => swipe(currentProfile, 'dislike')}
            onLike={() => swipe(currentProfile, 'like')}
            onSuperLike={() => swipe(currentProfile, 'super_like')}
            hasVideo={currentProfile.has_video}
            disabled={isSwiping}
          />

          {/* Match Overlay */}
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
        </>
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
  bellButton: {
    position: 'relative',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
