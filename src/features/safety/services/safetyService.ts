import api from '../../../lib/api';
import type {
  Block,
  CreateBlockPayload,
  CreateGeoBlockPayload,
  CreateReportPayload,
  GeoBlock,
} from '../types/safety.types';

export const safetyService = {
  async reportUser(payload: CreateReportPayload): Promise<void> {
    await api.post('/safety/reports', payload);
  },

  async blockUser(payload: CreateBlockPayload): Promise<Block> {
    const { data } = await api.post<{ data: Block }>('/safety/blocks', payload);
    return data.data;
  },

  async unblockUser(blockId: string): Promise<void> {
    await api.delete(`/safety/blocks/${blockId}`);
  },

  async getBlocks(): Promise<Block[]> {
    const { data } = await api.get<{ data: Block[] }>('/safety/blocks');
    return data.data;
  },

  async getGeoBlocks(): Promise<GeoBlock[]> {
    const { data } = await api.get<{ data: GeoBlock[] }>('/safety/geo-blocks');
    return data.data;
  },

  async createGeoBlock(payload: CreateGeoBlockPayload): Promise<GeoBlock> {
    const { data } = await api.post<{ data: GeoBlock }>('/safety/geo-blocks', payload);
    return data.data;
  },

  async deleteGeoBlock(uuid: string): Promise<void> {
    await api.delete(`/safety/geo-blocks/${uuid}`);
  },
};
