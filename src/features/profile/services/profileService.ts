import api from '../../../lib/api';
import type {
  MyProfile,
  PublicProfile,
  ProfilePhoto,
} from '../types/profile.types';
import type { EditProfileFormData } from '../schemas/editProfileSchema';

export const profileService = {
  async getMyProfile(): Promise<MyProfile> {
    const { data } = await api.get<{ data: MyProfile }>('/profiles/me');
    return data.data;
  },

  async updateProfile(payload: EditProfileFormData): Promise<MyProfile> {
    const { data } = await api.put<{ data: MyProfile }>('/profiles/me', payload);
    return data.data;
  },

  async getPublicProfile(uuid: string): Promise<PublicProfile> {
    const { data } = await api.get<{ data: PublicProfile }>(`/profiles/${uuid}`);
    return data.data;
  },

  async uploadPhoto(localUri: string): Promise<ProfilePhoto> {
    const formData = new FormData();
    formData.append('photo', { uri: localUri, type: 'image/jpeg', name: 'photo.jpg' } as never);
    const { data } = await api.post<{ data: ProfilePhoto }>('/profiles/me/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async deletePhoto(photoId: string): Promise<void> {
    await api.delete(`/profiles/me/photos/${photoId}`);
  },

  async reorderPhotos(orderedIds: string[]): Promise<void> {
    await api.patch('/profiles/me/photos/reorder', { ordered_ids: orderedIds });
  },

  async uploadVideo(uri: string, mimeType?: string, onProgress?: (percent: number) => void): Promise<void> {
    const formData = new FormData();
    formData.append('video', { uri, type: mimeType || 'video/mp4', name: 'video' } as never);
    await api.post('/profiles/me/video', formData, {
      transformRequest: (data, headers) => {
        delete headers['Content-Type'];
        return data;
      },
      onUploadProgress: onProgress
        ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); }
        : undefined,
    });
  },

  async deleteVideo(): Promise<void> {
    await api.delete('/profiles/me/video');
  },
};
