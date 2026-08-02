import api from '../../../lib/api';
import type { PremiumSettings } from '../types/premium.types';

export const premiumService = {
  async getSettings(): Promise<PremiumSettings> {
    const res = await api.get<{ data: PremiumSettings }>('/premium/settings');
    return res.data.data;
  },
};
