export interface CatalogItem {
  id: string;
  slug: string;
  label: string;
}

export type InterestCategory = 'culture_art' | 'activism_community' | 'lifestyle' | 'tech_science';

export interface Interest extends CatalogItem {
  category: InterestCategory;
}

export type Intention = 'partner' | 'friendship' | 'community' | 'mentorship';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  custom_gender_identity: string | null;
  custom_orientation: string | null;
  custom_pronouns: string | null;
  custom_interests: string | null;
  intention: Intention | null;
  bio: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_processed: boolean;
  photo_url: string | null;
  onboarding_step: number;
  onboarding_completed: boolean;
  gender_identities?: CatalogItem[];
  orientations?: CatalogItem[];
  pronouns?: CatalogItem[];
  interests?: Interest[];
  // "¿A quién te gustaría conocer?" — ver features/matching/specs/spec.md →
  // "Compatibilidad de género". `interested_in_all_genders` siempre viene
  // presente (columna escalar, no relación); `interested_genders` sigue el
  // mismo patrón `whenLoaded` que `gender_identities`/`orientations`, así
  // que puede venir ausente (no `[]`) si el endpoint no cargó la relación —
  // ej. `GET /onboarding/status` hoy no la eager-carga, gap de backend
  // fuera de este alcance.
  interested_in_all_genders?: boolean;
  interested_genders?: CatalogItem[];
}

export interface OnboardingStatus {
  current_step: number;
  completed: boolean;
  profile: Profile | null;
}

