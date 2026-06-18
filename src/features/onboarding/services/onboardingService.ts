import api from '../../../lib/api';
import axios from 'axios';
import type {
  CatalogItem,
  Interest,
  InterestCategory,
  OnboardingStatus,
  Profile,
  VideoPresignedUrl,
} from '../types/onboarding.types';
import type { IdentityFormData } from '../schemas/identitySchema';
import type { PronounsFormData } from '../schemas/pronounsSchema';
import type { IntentionFormData } from '../schemas/intentionSchema';
import type { SafetyFormData } from '../schemas/safetySchema';

interface SaveInterestsPayload {
  interest_ids: string[];
  custom_interests?: string;
}

interface CatalogsResponse {
  gender_identities: CatalogItem[];
  orientations: CatalogItem[];
  pronouns: CatalogItem[];
  interests: Record<InterestCategory, Interest[]>;
}

export const onboardingService = {
  async getCatalogs(): Promise<CatalogsResponse> {
    const { data } = await api.get<{ data: CatalogsResponse }>('/onboarding/catalogs');
    return data.data;
  },

  async getStatus(): Promise<OnboardingStatus> {
    const { data } = await api.get<{ data: OnboardingStatus }>('/onboarding/status');
    return data.data;
  },

  async saveIdentity(payload: IdentityFormData): Promise<Profile> {
    const { data } = await api.post<{ data: Profile }>('/onboarding/step/identity', payload);
    return data.data;
  },

  async savePronouns(payload: PronounsFormData): Promise<Profile> {
    const { data } = await api.post<{ data: Profile }>('/onboarding/step/pronouns', payload);
    return data.data;
  },

  async saveIntention(payload: IntentionFormData): Promise<Profile> {
    const { data } = await api.post<{ data: Profile }>('/onboarding/step/intention', payload);
    return data.data;
  },

  async saveInterests(payload: SaveInterestsPayload): Promise<Profile> {
    const { data } = await api.post<{ data: Profile }>('/onboarding/step/interests', payload);
    return data.data;
  },

  async saveVideo(videoKey: string): Promise<Profile> {
    const { data } = await api.post<{ data: Profile }>('/onboarding/step/video', {
      video_key: videoKey,
    });
    return data.data;
  },

  async saveSafety(payload: SafetyFormData): Promise<void> {
    await api.post('/onboarding/step/safety', payload);
  },

  async getVideoPresignedUrl(): Promise<VideoPresignedUrl> {
    const { data } = await api.post<{ data: VideoPresignedUrl }>(
      '/onboarding/video/presigned-url',
    );
    return data.data;
  },

  async uploadVideoToS3(uploadUrl: string, file: Blob): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'video/mp4' },
    });
  },
};
