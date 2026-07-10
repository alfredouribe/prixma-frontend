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
  photos: ProfilePhoto[];
  statistics: ProfileStats;
}

export interface PublicProfile {
  id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  intention: Intention | null;
  photo_url: string | null;
  video_url: string | null;
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
