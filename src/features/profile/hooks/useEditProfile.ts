import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { profileService } from '../services/profileService';
import { editProfileSchema, type EditProfileFormData } from '../schemas/editProfileSchema';
import { extractApiError } from '../../../lib/extractApiError';
import type { MyProfile, ProfilePhoto } from '../types/profile.types';

type VideoUploadState = 'idle' | 'uploading' | 'done' | 'error';
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export function useEditProfile(initial: MyProfile) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initial.photos ?? []);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initial.video_url);
  const [videoState, setVideoState] = useState<VideoUploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: initial.display_name,
      bio: initial.bio ?? '',
      city: initial.city ?? '',
      latitude: initial.latitude ?? null,
      longitude: initial.longitude ?? null,
      intention: initial.intention ?? undefined,
      gender_identity_ids: initial.gender_identities?.map((g) => g.id) ?? [],
      orientation_ids: initial.orientations?.map((o) => o.id) ?? [],
      pronoun_ids: initial.pronouns?.map((p) => p.id) ?? [],
      interest_ids: initial.interests?.map((i) => i.id) ?? [],
      custom_gender_identity: initial.custom_gender_identity ?? '',
      custom_orientation: initial.custom_orientation ?? '',
      custom_pronouns: initial.custom_pronouns ?? '',
      custom_interests: initial.custom_interests ?? '',
    },
  });

  async function handleSave(data: EditProfileFormData) {
    setIsSaving(true);
    setSaveError(null);
    try {
      await profileService.updateProfile(data);
      router.back();
    } catch (err) {
      setSaveError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePickPhoto() {
    if (photos.length >= 6) {
      setPhotoError('Máximo 6 fotos permitidas.');
      return;
    }

    Alert.alert('Agregar foto', '¿Desde dónde quieres subir tu foto?', [
      { text: 'Cámara', onPress: pickPhotoFromCamera },
      { text: 'Galería', onPress: pickPhotoFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function pickPhotoFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Necesitas permitir el acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (result.canceled) return;
    await processPhotoAsset(result.assets[0].uri);
  }

  async function pickPhotoFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (result.canceled) return;
    await processPhotoAsset(result.assets[0].uri);
  }

  async function processPhotoAsset(uri: string) {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: SaveFormat.JPEG },
      );
      const photo = await profileService.uploadPhoto(compressed.uri);
      setPhotos((prev) => [...prev, photo]);
    } catch (err) {
      setPhotoError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      await profileService.deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      setPhotoError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  async function handleReorderPhotos(orderedIds: string[]) {
    const reordered = orderedIds
      .map((id, index) => {
        const photo = photos.find((p) => p.id === id);
        return photo ? { ...photo, position: index + 1 } : null;
      })
      .filter(Boolean) as ProfilePhoto[];

    setPhotos(reordered);

    try {
      await profileService.reorderPhotos(orderedIds);
    } catch (err) {
      setPhotoError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  async function handlePickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      quality: 1,
      // TODO: PENDIENTE IMPORTANTE — descomentar para fix de HEVC Dolby Vision
      // preferredAssetRepresentationMode:
      //   ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_VIDEO_SIZE) {
      setVideoState('error');
      setVideoError('El video no puede superar los 200 MB.');
      return;
    }

    setVideoState('uploading');
    setVideoError(null);
    setUploadProgress(0);

    try {
      await profileService.uploadVideo(asset.uri, asset.mimeType ?? undefined, (p) => setUploadProgress(p));
      setVideoUrl(asset.uri);
      setVideoState('done');
    } catch (err) {
      setVideoState('error');
      setVideoError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  async function handleDeleteVideo() {
    try {
      await profileService.deleteVideo();
      setVideoUrl(null);
      setVideoState('idle');
      setVideoError(null);
    } catch (err) {
      setVideoError(extractApiError(err, 'Algo salió mal. Revisa tu conexión e intenta de nuevo.'));
    }
  }

  return {
    form,
    handleSave: form.handleSubmit(handleSave),
    isSaving,
    saveError,
    photos,
    isUploadingPhoto,
    photoError,
    handlePickPhoto,
    handleDeletePhoto,
    handleReorderPhotos,
    videoUrl,
    videoState,
    uploadProgress,
    videoError,
    handlePickVideo,
    handleDeleteVideo,
  };
}
