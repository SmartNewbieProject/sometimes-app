import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Button, ImageSelector } from '@/src/shared/ui';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import apis from '@/src/features/mypage/apis';
import { useQueryClient } from '@tanstack/react-query';

export const ChangeProfileImageModal = () => {
  const { hideModal, showErrorModal } = useModal();
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();

  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validImages = images.filter(img => img !== null);
  const isAllImagesSelected = validImages.length === 3;

  useEffect(() => {
    if (profileDetails) {
      const currentImages = profileDetails.profileImages.map(img => img.url);
      const initialImages = [...currentImages, ...Array(3 - currentImages.length).fill(null)];
      setImages(initialImages.slice(0, 3));
    }
  }, [profileDetails]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!profileDetails) {
      showErrorModal('프로필 정보를 불러올 수 없습니다.', 'error');
      return;
    }

    // 최소 3개 이상의 이미지가 있는지 확인
    const validImages = images.filter(img => img !== null);
    if (validImages.length !== 3) {
      showErrorModal('프로필 이미지 3장을 모두 등록해주세요.', 'announcement');
      return;
    }

    setIsSubmitting(true);

    try {
      const validImagesArray = validImages as string[];
      const oldImages = profileDetails.profileImages || [];
      const hasExistingImages = oldImages.length > 0;

      if (hasExistingImages) {
        for (let i = 0; i < validImagesArray.length; i++) {
          const newImage = validImagesArray[i];

          try {
            if (oldImages[0]) {
              try {
                await apis.deleteProfileImage(oldImages[0].id);
                oldImages.shift();
              } catch (deleteError) {
                throw new Error(`기존 이미지 삭제 실패: ${deleteError}`);
              }
            }

            await apis.uploadProfileImage(newImage, 2);

          } catch (uploadError) {
            throw new Error(`${i + 1}번째 이미지 교체 실패: ${uploadError}`);
          }
        }
      } else {
        for (let i = 0; i < validImagesArray.length; i++) {
          const newImage = validImagesArray[i];

          try {
            await apis.uploadProfileImage(newImage, i);
          } catch (uploadError) {
            throw new Error(`${i + 1}번째 이미지 추가 실패: ${uploadError}`);
          }
        }
      }

      if (oldImages.length > validImagesArray.length) {
        for (let i = validImagesArray.length; i < oldImages.length; i++) {
          try {
            await apis.deleteProfileImage(oldImages[i].id);
          } catch (deleteError) {
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['my-profile-details'] });

      hideModal();
      showErrorModal('프로필 이미지가 성공적으로 변경되었습니다.', 'announcement');
    } catch (error: any) {
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showErrorModal(`프로필 이미지 변경 중 오류가 발생했습니다: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profileDetails) {
    return (
      <View className="items-center justify-center p-4">
        <ActivityIndicator size="large" color="#6A3EA1" />
        <Text className="mt-2 text-center" textColor="black">프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <Text className="text-lg font-semibold mb-4 text-center" textColor="black">
        프로필 이미지 변경
      </Text>

      <Text className="mb-4 text-center" textColor="black">
        매칭을 위해 프로필 사진 3장을 모두 등록해주세요.
      </Text>

      <View className="mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 16,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '100%'
          }}
          className="mb-4"
        >
          {images.map((image, index) => (
            <View key={index} style={{ width: 120, height: 120 }}>
              <ImageSelector
                size="sm"
                value={image ?? undefined}
                onChange={(value) => handleImageChange(index, value)}
              />
            </View>
          ))}
        </ScrollView>
        <Text className="text-xs text-center" textColor="gray">
          얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
        </Text>
        <Text className="text-xs text-center mt-1" textColor="gray">
          좌우로 스크롤하여 이미지를 추가해주세요.
        </Text>
      </View>

      <View className="flex flex-row gap-x-2">
        <Button
          variant="secondary"
          onPress={hideModal}
          className="flex-1"
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          variant="primary"
          onPress={handleSubmit}
          className="flex-1"
          disabled={isSubmitting || !isAllImagesSelected}
        >
          {isSubmitting ? '변경 중...' : '변경 완료'}
        </Button>
      </View>
    </View>
  );
};

export default ChangeProfileImageModal;
