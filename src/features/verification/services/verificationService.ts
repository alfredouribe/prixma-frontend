import api from '../../../lib/api';
import type { VerificationStatusData } from '../types/verification.types';

export const verificationService = {
  /**
   * Envía el documento de identidad (y selfie opcional) directo al backend
   * como `multipart/form-data`. El backend es quien comprime (ffmpeg) y sube
   * a S3 — el cliente nunca sube directo a S3 (ver constitution.md → "Media
   * Upload Pipeline"). Mismo patrón que `profileService.uploadPhoto`.
   */
  async submit(documentUri: string, selfieUri?: string): Promise<VerificationStatusData> {
    const formData = new FormData();
    formData.append('document', { uri: documentUri, type: 'image/jpeg', name: 'document.jpg' } as never);
    if (selfieUri) {
      formData.append('selfie', { uri: selfieUri, type: 'image/jpeg', name: 'selfie.jpg' } as never);
    }

    const { data } = await api.post<{ data: VerificationStatusData }>('/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async getStatus(): Promise<VerificationStatusData | null> {
    const { data } = await api.get<{ data: VerificationStatusData | null }>('/verification/status');
    return data.data;
  },
};
