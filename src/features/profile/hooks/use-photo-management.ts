import { useState } from 'react';
import {
  setMainProfileImage,
  deleteProfileImage,
  replaceApprovedImage,
  uploadProfileImage,
  reuploadProfileImage,
  markPhotoAsReviewed
} from '../apis/photo-management';
import { useManagementSlots } from '../queries/use-management-slots';
import { useToast } from '@/src/shared/hooks/use-toast';
import { useModal } from '@/src/shared/hooks/use-modal';
import { fileUtils, platform } from '@/src/shared/libs';
import type { ProfileImage, ManagementSlot } from '@/src/types/user';
import { devLogWithTag, devWarn } from '@/src/shared/utils';

export function usePhotoManagement() {
  const { data: managementData, refetch } = useManagementSlots();
  const { emitToast } = useToast();
  const { showModal } = useModal();
  const [isActionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfileImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API는 images 배열을 반환하므로 slots 형식으로 변환
  // 이미지의 slotIndex 필드를 기준으로 정확한 슬롯에 배치
  const slots: ManagementSlot[] = managementData?.images
    ? [0, 1, 2].map((slotIndex) => ({
        slotIndex,
        image: managementData.images.find((img) => img?.slotIndex === slotIndex) ?? null,
      }))
    : [
        { slotIndex: 0, image: null },
        { slotIndex: 1, image: null },
        { slotIndex: 2, image: null },
      ];

  // 기존 호환성을 위해 photos 배열도 제공
  const photos = slots
    .filter((slot): slot is ManagementSlot & { image: ProfileImage } => slot.image !== null)
    .map(slot => slot.image);

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
      const file = await platform({
        web: async () => {
          const blob = await fileUtils.dataURLtoBlob(imageUri);
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
    } catch (error: any) {
      const errorMessage = error?.message || '사진 교체에 실패했습니다';
      emitToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async (imageUri: string, slotIndex: number) => {
    setIsLoading(true);
    try {
      const uploadResponse = await uploadProfileImage(imageUri, slotIndex);
      devLogWithTag('Photo Mgmt', 'Upload complete:', { photoId: uploadResponse?.image?.id });

      const refetchResult = await refetch();
      devLogWithTag('Photo Mgmt', 'Refetch complete:', {
        imageCount: refetchResult.data?.images?.length
      });

      emitToast('사진이 추가되었습니다. 관리자 승인 후 반영됩니다');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        emitToast('해당 슬롯에 이미 승인된 사진이 있습니다. 교체 기능을 사용하세요');
      } else {
        emitToast('사진 추가에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReuploadPhoto = async (photo: ProfileImage, imageUri: string) => {
    devLogWithTag('Photo Reupload', 'Starting:', {
      photoId: photo.id,
      retryCount: photo.retryCount,
      status: photo.reviewStatus,
    });

    if (photo.retryCount && photo.retryCount >= 3) {
      emitToast('최대 재심사 횟수를 초과했습니다. 고객센터에 문의하세요');
      return;
    }

    setIsLoading(true);
    try {
      const file = await platform({
        web: async () => {
          const blob = await fileUtils.dataURLtoBlob(imageUri);
          return fileUtils.toFile(blob, `profile-${Date.now()}.jpg`);
        },
        default: () =>
          ({
            uri: imageUri,
            name: `profile-${Date.now()}.jpg`,
            type: 'image/jpeg',
          } as any),
      });

      devLogWithTag('Photo Reupload', 'File created:', {
        fileName: (file as any).name,
        fileType: (file as any).type,
      });

      const response = await reuploadProfileImage(photo.id, file);
      devLogWithTag('Photo Reupload', 'API complete');

      const refetchResult = await refetch();
      devLogWithTag('Photo Reupload', 'Refetch complete:', {
        imageCount: refetchResult.data?.images?.length
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
      if (error?.errorCode === 'MAX_RETRY_EXCEEDED') {
        emitToast('최대 재심사 횟수를 초과했습니다. 고객센터에 문의하세요');
      } else {
        const errorMessage = error?.message || '사진 재업로드에 실패했습니다';
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
      devWarn('Failed to mark as reviewed:', error);
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
    slots,
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
