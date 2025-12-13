import { useState } from 'react';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { useProfileDetailsQuery } from '@/src/features/auth/queries/use-profile-details';
import {
  setMainProfileImage,
  deleteProfileImage,
  replaceApprovedImage,
  uploadProfileImage,
  reuploadProfileImage,
  markPhotoAsReviewed
} from '../apis/photo-management';
import { useToast } from '@/src/shared/hooks/use-toast';
import { useModal } from '@/src/shared/hooks/use-modal';
import { fileUtils, platform } from '@/src/shared/libs';
import type { ProfileImage } from '@/src/types/user';

export function usePhotoManagement() {
  const { value: accessToken } = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });
  const { data: profileDetails, refetch } = useProfileDetailsQuery(accessToken);
  const { emitToast } = useToast();
  const { showModal } = useModal();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfileImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const photos = profileDetails?.profileImages || [];
  const approvedPhotos = photos.filter(
    (p) => p.reviewStatus?.toUpperCase() === 'APPROVED' || !p.reviewStatus
  );

  const handleSetMainPhoto = async (photo: ProfileImage) => {
    if (photo.isMain) {
      emitToast('이미 대표 사진입니다');
      return;
    }

    if (approvedPhotos.length < 2) {
      emitToast('대표 사진을 변경하려면 최소 2장의 승인된 사진이 필요합니다');
      return;
    }

    setIsLoading(true);
    try {
      await setMainProfileImage(photo.id);
      await refetch();
      emitToast('대표 프로필이 변경되었습니다');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        emitToast('이미 대표 사진입니다');
      } else {
        emitToast('대표 사진 변경에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photo: ProfileImage) => {
    if (approvedPhotos.length <= 1) {
      emitToast('최소 1장의 사진이 필요합니다');
      return;
    }

    setIsLoading(true);
    try {
      await deleteProfileImage(photo.id);
      await refetch();
      emitToast('사진이 삭제되었습니다');
    } catch (error) {
      emitToast('사진 삭제에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePhoto = async (photo: ProfileImage, imageUri: string) => {
    setIsLoading(true);
    try {
      const file = platform({
        web: () => {
          const blob = fileUtils.dataURLtoBlob(imageUri);
          return fileUtils.toFile(blob, `profile-${Date.now()}.jpg`);
        },
        default: () =>
          ({
            uri: imageUri,
            name: `profile-${Date.now()}.jpg`,
            type: 'image/jpeg',
          } as any),
      });

      await replaceApprovedImage(photo.id, file);
      await refetch();
      emitToast('사진이 교체되었습니다. 관리자 승인 후 반영됩니다');
    } catch (error) {
      emitToast('사진 교체에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async (imageUri: string, order: number) => {
    setIsLoading(true);
    try {
      await uploadProfileImage(imageUri, order);
      await refetch();
      emitToast('사진이 추가되었습니다. 관리자 승인 후 반영됩니다');
    } catch (error) {
      emitToast('사진 추가에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReuploadPhoto = async (photo: ProfileImage, imageUri: string) => {
    console.log('[REUPLOAD] Starting reupload for photo:', {
      photoId: photo.id,
      currentRetryCount: photo.retryCount,
      currentStatus: photo.reviewStatus,
    });

    if (photo.retryCount && photo.retryCount >= 3) {
      emitToast('최대 재심사 횟수를 초과했습니다. 고객센터에 문의하세요');
      return;
    }

    setIsLoading(true);
    try {
      const file = platform({
        web: () => {
          const blob = fileUtils.dataURLtoBlob(imageUri);
          return fileUtils.toFile(blob, `profile-${Date.now()}.jpg`);
        },
        default: () =>
          ({
            uri: imageUri,
            name: `profile-${Date.now()}.jpg`,
            type: 'image/jpeg',
          } as any),
      });

      console.log('[REUPLOAD] File created:', {
        fileName: (file as any).name,
        fileType: (file as any).type,
        hasUri: !!(file as any).uri,
      });

      const response = await reuploadProfileImage(photo.id, file);
      console.log('[REUPLOAD] API response:', response);

      const refetchResult = await refetch();
      console.log('[REUPLOAD] Refetch completed, new data:', {
        totalPhotos: refetchResult.data?.profileImages?.length,
        targetPhoto: refetchResult.data?.profileImages?.find((p: any) => p.id === photo.id),
      });

      // 재심사 요청 안내 모달 표시
      showModal({
        title: '재심사 요청 완료',
        children: '사진이 재업로드되었습니다.\n관리자 심사가 완료될 때까지 기다려 주세요.\n보통 24시간 이내에 심사가 완료됩니다.',
        primaryButton: {
          text: '확인',
          onClick: () => {},
        },
      });
    } catch (error: any) {
      console.error('[REUPLOAD] Error occurred:', {
        errorCode: error?.response?.data?.errorCode,
        errorMessage: error?.response?.data?.message,
        status: error?.response?.status,
        fullError: error,
      });

      if (error?.response?.data?.errorCode === 'MAX_RETRY_EXCEEDED') {
        emitToast('최대 재심사 횟수를 초과했습니다. 고객센터에 문의하세요');
      } else {
        const errorMessage = error?.response?.data?.message || '사진 재업로드에 실패했습니다';
        emitToast(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReviewed = async (photoId: string) => {
    try {
      await markPhotoAsReviewed(photoId);
      await refetch();
    } catch (error) {
      // 백그라운드 작업이므로 에러 무시
      console.warn('Failed to mark as reviewed:', error);
    }
  };

  const openActionSheet = (photo: ProfileImage) => {
    setSelectedPhoto(photo);
    setActionSheetVisible(true);
  };

  const closeActionSheet = () => {
    setActionSheetVisible(false);
    setSelectedPhoto(null);
  };

  return {
    photos,
    approvedPhotos,
    selectedPhoto,
    isActionSheetVisible,
    isLoading,
    handleSetMainPhoto,
    handleDeletePhoto,
    handleChangePhoto,
    handleAddPhoto,
    handleReuploadPhoto,
    handleMarkAsReviewed,
    openActionSheet,
    closeActionSheet,
  };
}
