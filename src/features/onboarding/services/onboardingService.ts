import api from '../../../lib/api';
import type {
  CatalogItem,
  Interest,
  InterestCategory,
  OnboardingStatus,
  Profile,
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

  async uploadVideo(uri: string, mimeType?: string): Promise<void> {
    const formData = new FormData();
    formData.append('video', {
      uri,
      type: mimeType || 'video/mp4',
      name: 'video',
    } as unknown as Blob);

    // React Native genera el Content-Type con el boundary correcto al detectar FormData.
    // Sobreescribirlo manualmente rompe el parseo multipart en PHP.
    await api.post('/onboarding/video/upload', formData, {
      transformRequest: (data, headers) => {
        delete headers['Content-Type'];
        return data;
      },
    });
  },

  async saveSafety(payload: SafetyFormData): Promise<void> {
    await api.post('/onboarding/step/safety', payload);
  },
};
