export type SwipeDirection = 'like' | 'dislike' | 'super_like';

export type Intention = 'partner' | 'friendship' | 'community' | 'mentorship';

export interface ExploreProfile {
  id: string;
  display_name: string;
  age: number;
  pronouns: string[];
  gender_identities: string[];
  orientations: string[];
  city: string | null;
  bio: string | null;
  intention: Intention | null;
  is_verified: boolean;
  has_video: boolean;
  interests: string[];
  photos: ProfilePhoto[];
}

export interface ProfilePhoto {
  id: string;
  url: string;
  position: number;
}

export interface SwipeResult {
  swiped: boolean;
  matched: boolean;
  match_id: string | null;
}

export interface MatchOtherUser {
  id: string;
  display_name: string;
  age: number | null;
  is_verified: boolean;
  city: string | null;
  intention: Intention | null;
  photo: string | null;
}

export interface Match {
  id: string;
  matched_at: string;
  other_user: MatchOtherUser | null;
}

export interface MatchingPreferences {
  id: string;
  age_min: number;
  age_max: number;
  max_distance_km: number;
  intentions: Intention[] | null;
  gender_identities: string[] | null;
  orientations: string[] | null;
  verified_only: boolean;
  has_video_only: boolean;
}

export type MatchingPreferencesUpdate = Partial<Omit<MatchingPreferences, 'id'>>;
