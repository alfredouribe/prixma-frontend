import api from '../../../lib/api';
import { uploadAsync } from 'expo-file-system/legacy';
import type {
  MyProfile,
  PublicProfile,
  ProfilePhoto,
  VideoPresignedUrl,
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

  async getVideoPresignedUrl(): Promise<VideoPresignedUrl> {
    const { data } = await api.post<{ data: VideoPresignedUrl }>(
      '/profiles/me/video/presigned-url',
    );
    return data.data;
  },

  async uploadVideoToS3(uploadUrl: string, localUri: string): Promise<void> {
    await uploadAsync(uploadUrl, localUri, {
      httpMethod: 'PUT',
      uploadType: 0,
      headers: { 'Content-Type': 'video/mp4' },
    });
  },

  async saveVideo(videoKey: string): Promise<void> {
    await api.post('/profiles/me/video', { video_key: videoKey });
  },

  async deleteVideo(): Promise<void> {
    await api.delete('/profiles/me/video');
  },
};
