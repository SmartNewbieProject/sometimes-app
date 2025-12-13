import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';
import { Header } from '@/src/shared/ui/header';
import { PhotoStatusCard, PhotoStatusWrapper, OppositeGenderPreview } from '@/src/widgets';
import { ImageSelector, type ImageSelectorRef } from '@/src/shared/ui';
import { usePhotoManagement } from '@/src/features/profile/hooks/use-photo-management';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Button } from '@/src/shared/ui/button';
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

  // 3개 슬롯 준비 (대표 사진 우선, 그 다음 order 기준 정렬)
  const sortedPhotos = [...photos].sort((a, b) => {
    // 대표 사진을 항상 첫 번째 슬롯에 배치
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    // 나머지는 order 순서대로
    return a.order - b.order;
  });
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [photoIds, setPhotoIds] = useState<(string | null)[]>([null, null, null]);

  useEffect(() => {
    // 기존 사진을 이미지 배열에 매핑
    const newImages = [null, null, null];
    const newPhotoIds = [null, null, null];

    console.log('[PHOTO_MGMT] Mapping photos to slots:', {
      totalPhotos: sortedPhotos.length,
      sortedPhotos: sortedPhotos.map((p, i) => ({
        index: i,
        id: p.id,
        order: p.order,
        isMain: p.isMain,
        reviewStatus: p.reviewStatus,
      })),
    });

    sortedPhotos.forEach((photo, index) => {
      if (index < 3) {
        newImages[index] = photo.url;
        newPhotoIds[index] = photo.id;
      }
    });

    // 값이 실제로 변경되었을 때만 상태 업데이트 (무한 루프 방지)
    const idsChanged = newPhotoIds.some((id, i) => id !== photoIds[i]);
    if (idsChanged) {
      console.log('[PHOTO_MGMT] Updating slot mappings:', {
        slot0: newPhotoIds[0],
        slot1: newPhotoIds[1],
        slot2: newPhotoIds[2],
      });
      setImages(newImages);
      setPhotoIds(newPhotoIds);
    }
  }, [photos, sortedPhotos, photoIds]);

  const handleImageChange = async (index: number, value: string) => {
    console.log('[PHOTO_MGMT] handleImageChange called:', {
      index,
      valueLength: value.length,
      existingPhotoId: photoIds[index],
    });

    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);

    // 기존 사진이 있으면 변경, 없으면 새로 추가
    const existingPhotoId = photoIds[index];
    if (existingPhotoId) {
      const photo = sortedPhotos.find(p => p.id === existingPhotoId);
      console.log('[PHOTO_MGMT] Found existing photo:', {
        photoId: photo?.id,
        reviewStatus: photo?.reviewStatus,
        retryCount: photo?.retryCount,
        order: photo?.order,
      });

      if (photo) {
        // 거절된 사진이면 reupload API 사용
        const normalizedStatus = photo.reviewStatus?.toUpperCase();
        if (normalizedStatus === 'REJECTED') {
          console.log('[PHOTO_MGMT] Using reupload API for rejected photo');
          await handleReuploadPhoto(photo, value);
        } else {
          console.log('[PHOTO_MGMT] Using replace API for approved photo');
          await handleChangePhoto(photo, value);
        }
      } else {
        console.error('[PHOTO_MGMT] Photo not found in sortedPhotos:', {
          existingPhotoId,
          sortedPhotosIds: sortedPhotos.map(p => p.id),
        });
      }
    } else {
      // 새 사진 추가 - 각 슬롯의 인덱스에 맞는 order로 추가
      console.log('[PHOTO_MGMT] Adding new photo with order:', index);
      await handleAddPhoto(value, index);
    }
  };

  const getPhotoByIndex = (index: number): ProfileImage | null => {
    const photoId = photoIds[index];
    if (!photoId) return null;
    return sortedPhotos.find(p => p.id === photoId) || null;
  };

  const mainPhoto = sortedPhotos.find(p => p.isMain);

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
                value={images[0] || undefined}
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
                value={images[1] || undefined}
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
                value={images[2] || undefined}
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
