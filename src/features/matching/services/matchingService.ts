import api from '../../../lib/api';
import type {
  ExploreProfile,
  Match,
  MatchingPreferences,
  MatchingPreferencesUpdate,
  SwipeDirection,
  SwipeResult,
} from '../types/matching.types';

export const matchingService = {
  async getExploreQueue(limit = 25): Promise<ExploreProfile[]> {
    const res = await api.get<{ data: ExploreProfile[] }>('/matching/explore', {
      params: { limit },
    });
    return res.data.data;
  },

  async swipe(swipedId: string, direction: SwipeDirection): Promise<SwipeResult> {
    const res = await api.post<{ data: SwipeResult }>('/matching/swipe', {
      swiped_id: swipedId,
      direction,
    });
    return res.data.data;
  },

  async getMatches(): Promise<Match[]> {
    const res = await api.get<{ data: Match[] }>('/matching/matches');
    return res.data.data;
  },

  async getPreferences(): Promise<MatchingPreferences> {
    const res = await api.get<{ data: MatchingPreferences }>('/matching/preferences');
    return res.data.data;
  },

  async updatePreferences(data: MatchingPreferencesUpdate): Promise<MatchingPreferences> {
    const res = await api.put<{ data: MatchingPreferences }>('/matching/preferences', data);
    return res.data.data;
  },
};
