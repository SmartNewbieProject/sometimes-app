import { axiosClient, fileUtils, platform } from '@/src/shared/libs';
import type { RejectedImagesResponse, AddImageResponse, ReplaceImageResponse, ManagementImagesResponse } from '@/src/types/user';
import { nanoid } from 'nanoid';
import { devLogWithTag } from '@/src/shared/utils';

export const setMainProfileImage = async (imageId: string): Promise<void> => {
  return axiosClient.put(`/v1/profile/images/${imageId}/set-main`);
};

export const deleteProfileImage = async (imageId: string): Promise<void> => {
  return axiosClient.delete(`/v1/profile/images/${imageId}`);
};

export const replaceApprovedImage = async (
  imageId: string,
  imageFile: File | { uri: string; name: string; type: string }
): Promise<ReplaceImageResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile as any);

  return axiosClient.put(`/v1/profile/images/${imageId}/replace`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadProfileImage = async (
  imageUri: string,
  slotIndex: number
): Promise<AddImageResponse> => {
  devLogWithTag('Profile API', 'uploadProfileImage:', { slotIndex });

  const formData = new FormData();
  const file = await platform({
    web: async () => {
      const blob = await fileUtils.dataURLtoBlob(imageUri);
      return fileUtils.toFile(blob, `profile-${nanoid(6)}.png`);
    },
    default: () =>
      ({
        uri: imageUri,
        name: `profile-${nanoid(6)}.png`,
        type: 'image/jpeg',
      } as any),
  });

  formData.append('image', file);
  formData.append('slotIndex', slotIndex.toString());

  const response = await axiosClient.post('/v1/profile/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  devLogWithTag('Profile API', 'Upload complete');
  return response;
};

export const getManagementSlots = async (): Promise<ManagementImagesResponse> => {
  return axiosClient.get('/v1/profile/images/management');
};

export const reuploadProfileImage = async (
  imageId: string,
  imageFile: File | { uri: string; name: string; type: string }
): Promise<void> => {
  devLogWithTag('Profile API', 'reuploadProfileImage:', {
    imageId,
    fileName: (imageFile as any).name,
  });

  const formData = new FormData();
  formData.append('image', imageFile as any);

  const response = await axiosClient.put(`/v1/profile/images/${imageId}/reupload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  devLogWithTag('Profile API', 'Reupload complete');
  return response;
};

export const markPhotoAsReviewed = async (imageId: string): Promise<void> => {
  return axiosClient.post(`/v1/profile/images/${imageId}/mark-reviewed`);
};

export const getRejectedImages = async (): Promise<RejectedImagesResponse> => {
  return axiosClient.get('/v1/profile/images/rejected');
};
