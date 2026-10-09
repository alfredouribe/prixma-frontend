import type { CatalogItem, Interest, Intention } from '../../onboarding/types/onboarding.types';

export type ProfileVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface ProfilePhoto {
  id: string;
  url: string;
  position: number;
}

export interface ProfileStats {
  likes_received: number;
  matches_count: number;
  events_count: number;
}

export interface MyProfile {
  id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  intention: Intention | null;
  custom_gender_identity: string | null;
  custom_orientation: string | null;
  custom_pronouns: string | null;
  custom_interests: string | null;
  photo_url: string | null;
  video_url: string | null;
  video_processed: boolean;
  onboarding_step: number;
  onboarding_completed: boolean;
  verification_status: ProfileVerificationStatus;
  gender_identities: CatalogItem[];
  orientations: CatalogItem[];
  pronouns: CatalogItem[];
  interests: Interest[];
  // "¿A quién te gustaría conocer?" — ver features/matching/specs/spec.md →
  // "Compatibilidad de género". `GET /profiles/me` siempre eager-carga
  // `interestedGenders`, así que ambos campos vienen siempre presentes
  // aquí (a diferencia de `onboarding.types.ts#Profile`, que los tipa
  // opcionales porque `GET /onboarding/status` no carga esa relación).
  interested_in_all_genders: boolean;
  interested_genders: CatalogItem[];
  photos: ProfilePhoto[];
  statistics: ProfileStats;
}

export interface PublicProfile {
  id: string;
  display_name: string;
  age: number | null;
  bio: string | null;
  city: string | null;
  intention: Intention | null;
  photo_url: string | null;
  video_url: string | null;
  has_video: boolean;
  custom_interests: string | null;
  is_verified: boolean;
  gender_identities: CatalogItem[];
  orientations: CatalogItem[];
  pronouns: CatalogItem[];
  interests: Interest[];
  photos: ProfilePhoto[];
}

export interface VideoPresignedUrl {
  upload_url: string;
  video_key: string;
}

export interface ProfileSettings {
  id: string;
  selfie_verification_enabled: boolean;
  incognito_mode_enabled: boolean;
  geo_block_enabled: boolean;
  reports_enabled: boolean;
  notify_matches_enabled: boolean;
  notify_messages_enabled: boolean;
  notify_events_enabled: boolean;
}
