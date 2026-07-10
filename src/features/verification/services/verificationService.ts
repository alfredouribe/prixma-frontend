import * as FileSystem from 'expo-file-system/legacy';
import api from '../../../lib/api';
import type {
  VerificationDocumentType,
  VerificationPresignedUrl,
  VerificationStatusData,
} from '../types/verification.types';

export const verificationService = {
  /**
   * Pide una URL pre-firmada de S3 (bucket privado de verificación, distinto
   * al de fotos de perfil). El archivo se sube directo a S3 con esa URL,
   * nunca pasa por Laravel.
   */
  async getPresignedUrl(type: VerificationDocumentType = 'document'): Promise<VerificationPresignedUrl> {
    const { data } = await api.post<{ data: VerificationPresignedUrl }>('/verification/presigned-url', { type });
    return data.data;
  },

  /**
   * Sube el archivo local directo a S3 vía la URL pre-firmada. No usa el
   * cliente Axios central (`api.ts`) a propósito: el destino es S3, no
   * nuestro backend, y no debe llevar el header Authorization del usuario.
   */
  async uploadToS3(uploadUrl: string, localUri: string): Promise<void> {
    await FileSystem.uploadAsync(uploadUrl, localUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': 'image/jpeg' },
    });
  },

  async submit(documentS3Key: string, selfieS3Key?: string): Promise<VerificationStatusData> {
    const { data } = await api.post<{ data: VerificationStatusData }>('/verification', {
      document_s3_key: documentS3Key,
      selfie_s3_key: selfieS3Key,
    });
    return data.data;
  },

  async getStatus(): Promise<VerificationStatusData | null> {
    const { data } = await api.get<{ data: VerificationStatusData | null }>('/verification/status');
    return data.data;
  },
};
