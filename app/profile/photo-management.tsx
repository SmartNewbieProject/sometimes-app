import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui/text';
import { Header } from '@/src/shared/ui/header';
import { PhotoStatusCard, PhotoStatusWrapper, OppositeGenderPreview } from '@/src/widgets';
import { ImageSelector, type ImageSelectorRef } from '@/src/shared/ui';
import { usePhotoManagement } from '@/src/features/profile/hooks/use-photo-management';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/features/auth';
import type { ProfileImage } from '@/src/types/user';

export default function PhotoManagementPage() {
  const { t } = useTranslation();
  const { showErrorModal } = useModal();
  const { profileDetails } = useAuth();
  const {
    photos,
    approvedPhotos,
    isLoading,
    handleChangePhoto,
    handleAddPhoto,
    handleReuploadPhoto,
    handleMarkAsReviewed,
  } = usePhotoManagement();

  // ImageSelector refs for each slot
  const imageSelectorRefs = useRef<(ImageSelectorRef | null)[]>([null, null, null]);

  // 슬롯 기반: photos 배열이 이미 서버에서 정렬된 상태
  // photos[0] = 대표 사진 슬롯, photos[1] = 두번째 슬롯, photos[2] = 세번째 슬롯
  console.log('[PHOTO_MGMT] Slot-based photos:', {
    slot0: photos[0] ? { id: photos[0].id, status: photos[0].reviewStatus, isMain: photos[0].isMain } : null,
    slot1: photos[1] ? { id: photos[1].id, status: photos[1].reviewStatus, isMain: photos[1].isMain } : null,
    slot2: photos[2] ? { id: photos[2].id, status: photos[2].reviewStatus, isMain: photos[2].isMain } : null,
  });

  const handleImageChange = async (index: number, value: string) => {
    try {
      console.log('[PHOTO_MGMT] handleImageChange called:', {
        index,
        valueLength: value.length,
      });

      // 슬롯 기반: 해당 인덱스의 사진 가져오기
      const photo = photos[index];

      if (photo) {
        // 기존 사진이 있는 경우
        console.log('[PHOTO_MGMT] Found existing photo in slot:', {
          slotIndex: index,
          photoId: photo.id,
          reviewStatus: photo.reviewStatus,
          retryCount: photo.retryCount,
          replacingImageId: photo.replacingImageId,
        });

        const normalizedStatus = photo.reviewStatus?.toUpperCase();

        // REJECTED 또는 PENDING 상태 사진은 재심사 요청 API 사용
        if (normalizedStatus === 'REJECTED' || normalizedStatus === 'PENDING') {
          console.log('[PHOTO_MGMT] Using reupload API for rejected/pending photo:', {
            status: normalizedStatus,
            photoId: photo.id,
          });
          await handleReuploadPhoto(photo, value);
        } else if (normalizedStatus === 'APPROVED') {
          console.log('[PHOTO_MGMT] Using replace API for approved photo');
          await handleChangePhoto(photo, value);
        } else {
          // reviewStatus가 없는 경우 (레거시 데이터 또는 예외 상황)
          console.warn('[PHOTO_MGMT] Photo has no reviewStatus, using replace API:', {
            photoId: photo.id,
            reviewStatus: photo.reviewStatus,
          });
          await handleChangePhoto(photo, value);
        }
      } else {
        // 새 사진 추가 - 슬롯 인덱스가 order
        console.log('[PHOTO_MGMT] Adding new photo to slot:', index);
        await handleAddPhoto(value, index);
      }

      // API 호출 성공 시 UI는 refetch()를 통해 자동으로 업데이트됨
      console.log('[PHOTO_MGMT] Image change completed successfully');
    } catch (error: any) {
      console.error('[PHOTO_MGMT] Error in handleImageChange:', error);

      // 에러 처리: UI는 변경하지 않음 (API 실패 시 원래 상태 유지)
      const errorMessage = error?.response?.data?.message || error?.message || '사진 업로드에 실패했습니다';

      // 특정 에러 메시지 처리
      if (errorMessage.includes('이미 해당 사진의 교체 요청이 심사 대기 중입니다')) {
        showErrorModal('이미 해당 사진의 교체 요청이 심사 대기 중입니다.\n심사 완료 후 다시 시도해주세요.', 'error');
      } else {
        showErrorModal(errorMessage, 'error');
      }
    }
  };

  const getPhotoByIndex = (index: number): ProfileImage | null => {
    return photos[index] || null;
  };

  const handleBackPress = () => {
    router.push('/profile-edit/profile');
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('features.mypage.profile_image_change.page_title')}
        showBackButton
        showLogo={false}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Status Card */}
        <PhotoStatusCard approvedCount={approvedPhotos.length} maxCount={3} />

        {/* Section Title */}
        <Text
          size="md"
          weight="semibold"
          textColor="secondary"
          style={styles.sectionTitle}
        >
          {t('features.mypage.my_photos')}
        </Text>

        {/* Image Grid (기존 ChangeProfileImageModal 스타일) */}
        <View style={styles.imageGrid}>
          {/* 왼쪽 대형 이미지 (대표 사진) */}
          <View style={styles.mainImageContainer}>
            <PhotoStatusWrapper
              reviewStatus={getPhotoByIndex(0)?.reviewStatus}
              rejectionReason={getPhotoByIndex(0)?.rejectionReason}
              isMain={true}
              retryCount={getPhotoByIndex(0)?.retryCount}
              imageId={getPhotoByIndex(0)?.id}
              isReviewed={getPhotoByIndex(0)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[0]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => (imageSelectorRefs.current[0] = el)}
                size="lg"
                value={photos[0]?.url || undefined}
                onChange={(value) => handleImageChange(0, value)}
              />
            </PhotoStatusWrapper>
          </View>

          {/* 오른쪽 소형 이미지 2개 */}
          <View style={styles.subImagesContainer}>
            <PhotoStatusWrapper
              reviewStatus={getPhotoByIndex(1)?.reviewStatus}
              rejectionReason={getPhotoByIndex(1)?.rejectionReason}
              isMain={false}
              retryCount={getPhotoByIndex(1)?.retryCount}
              imageId={getPhotoByIndex(1)?.id}
              isReviewed={getPhotoByIndex(1)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[1]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => (imageSelectorRefs.current[1] = el)}
                size="sm"
                value={photos[1]?.url || undefined}
                onChange={(value) => handleImageChange(1, value)}
              />
            </PhotoStatusWrapper>

            <PhotoStatusWrapper
              reviewStatus={getPhotoByIndex(2)?.reviewStatus}
              rejectionReason={getPhotoByIndex(2)?.rejectionReason}
              isMain={false}
              retryCount={getPhotoByIndex(2)?.retryCount}
              imageId={getPhotoByIndex(2)?.id}
              isReviewed={getPhotoByIndex(2)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[2]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => (imageSelectorRefs.current[2] = el)}
                size="sm"
                value={photos[2]?.url || undefined}
                onChange={(value) => handleImageChange(2, value)}
              />
            </PhotoStatusWrapper>
          </View>
        </View>

        {/* 가이드 메시지 */}
        <View style={styles.guideContainer}>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t('features.mypage.profile_image_change.guide')}
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t('apps.auth.sign_up.profile_image.info_desc_2')}
          </Text>
        </View>

        {/* 이성 프로필 미리보기 */}
        <OppositeGenderPreview
          uploadedCount={approvedPhotos.length}
          userGender={profileDetails?.gender}
        />
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={semanticColors.brand.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  mainImageContainer: {
    flex: 2,
    aspectRatio: 1,
  },
  subImagesContainer: {
    flex: 1,
    gap: 12,
  },
  guideContainer: {
    paddingHorizontal: 8,
    marginBottom: 32,
    gap: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
