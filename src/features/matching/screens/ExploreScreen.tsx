import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardActions } from '../components/CardActions';
import { EmptyExplore } from '../components/EmptyExplore';
import { FilterSheet } from '../components/FilterSheet';
import { MatchOverlay } from '../components/MatchOverlay';
import { ProfileCard } from '../components/ProfileCard';
import { useExploreQueue } from '../hooks/useExploreQueue';
import { useMatchingPreferences } from '../hooks/useMatchingPreferences';
import { useSwipe } from '../hooks/useSwipe';

export function ExploreScreen() {
  const [filtersVisible, setFiltersVisible] = useState(false);

  const { currentProfile, isEmpty, isLoading, advance, refresh } = useExploreQueue();
  const { preferences, updatePreferences } = useMatchingPreferences();

  const { swipe, matchResult, isSwiping, dismissMatch } = useSwipe({
    onSwipeComplete: advance,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9b5dff" />
      </View>
    );
  }

  if (isEmpty || !currentProfile) {
    return (
      <>
        <EmptyExplore onOpenFilters={() => setFiltersVisible(true)} />
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
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>prixma</Text>
          <TouchableOpacity
            onPress={() => setFiltersVisible(true)}
            accessibilityLabel="Abrir filtros"
            accessibilityRole="button"
          >
            <Ionicons name="options-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          <ProfileCard
            profile={currentProfile}
            onSwipe={(direction) => swipe(currentProfile, direction)}
          />
        </View>

        {/* Actions */}
        <CardActions
          onSkip={() => swipe(currentProfile, 'dislike')}
          onMessage={() => {
            // Message without match — opens solicitud flow (Chat feature)
          }}
          onLike={() => swipe(currentProfile, 'like')}
          onSuperLike={() => swipe(currentProfile, 'super_like')}
          disabled={isSwiping}
        />

        {/* Match Overlay */}
        {matchResult && (
          <MatchOverlay
            visible={true}
            myPhoto={null}
            otherProfile={matchResult.otherProfile}
            onSendMessage={() => {
              dismissMatch();
              // Navigate to chat — Chat feature
            }}
            onKeepExploring={dismissMatch}
          />
        )}

        {/* Filter Sheet */}
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
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
