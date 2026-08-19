import api from '../../../lib/api';
import type {
  ExploreProfile,
  Match,
  MatchingPreferences,
  MatchingPreferencesUpdate,
  RewindResult,
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

  // Lista de quién dio like/super_like al usuario, sin necesidad de match
  // previo — mismo shape de perfil que /explore (ExploreProfileResource),
  // sin tipo nuevo. El backend responde 403 si el usuario no tiene acceso
  // (ver features/premium/specs/spec.md → "Ver quién te dio like"), que el
  // frontend distingue por status code en useLikers.ts.
  async getLikers(): Promise<ExploreProfile[]> {
    const res = await api.get<{ data: ExploreProfile[] }>('/matching/likers');
    return res.data.data;
  },

  // Deshace el último swipe del usuario (cualquier dirección) — el backend
  // rechaza con 400 (`{ message }` genérico) si no quedan créditos, no hay
  // nada que deshacer, o el último swipe ya generó un match. Ver
  // features/premium/specs/plan.md → "Deshacer swipe / rewind".
  async rewind(): Promise<RewindResult> {
    const res = await api.post<{ data: RewindResult }>('/matching/rewind');
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
