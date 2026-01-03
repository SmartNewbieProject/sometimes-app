import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';
import { Header } from '@/src/shared/ui/header';
import { PhotoStatusCard, PhotoStatusWrapper, OppositeGenderPreview } from '@/src/widgets';
import { ImageSelector, type ImageSelectorRef } from '@/src/shared/ui';
import { usePhotoManagement } from '@/src/features/profile/hooks/use-photo-management';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/features/auth';

export default function PhotoManagementPage() {
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const {
    slots,
    approvedPhotos,
    isLoading,
    handleChangePhoto,
    handleAddPhoto,
    handleReuploadPhoto,
    handleMarkAsReviewed,
  } = usePhotoManagement();

  const imageSelectorRefs = useRef<(ImageSelectorRef | null)[]>([null, null, null]);

  const getSlotImage = (slotIndex: number) => slots[slotIndex]?.image;

  const handleImageChange = async (slotIndex: number, value: string) => {
    const existingImage = getSlotImage(slotIndex);
    console.log('[PHOTO_MGMT] handleImageChange called:', {
      slotIndex,
      valueLength: value.length,
      existingImageId: existingImage?.id,
      existingImageStatus: existingImage?.reviewStatus,
    });

    if (existingImage) {
      const normalizedStatus = existingImage.reviewStatus?.toUpperCase();
      if (normalizedStatus === 'REJECTED') {
        console.log('[PHOTO_MGMT] Using reupload API for rejected photo');
        await handleReuploadPhoto(existingImage, value);
      } else {
        console.log('[PHOTO_MGMT] Using replace API for approved/pending photo');
        await handleChangePhoto(existingImage, value);
      }
    } else {
      console.log('[PHOTO_MGMT] Adding new photo to slotIndex:', slotIndex);
      await handleAddPhoto(value, slotIndex);
    }
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
        <PhotoStatusCard approvedCount={approvedPhotos.length} maxCount={3} />

        <Text
          size="md"
          weight="semibold"
          textColor="secondary"
          style={styles.sectionTitle}
        >
          {t('features.mypage.my_photos')}
        </Text>

        <View style={styles.imageGrid}>
          <View style={styles.mainImageContainer}>
            <PhotoStatusWrapper
              reviewStatus={getSlotImage(0)?.reviewStatus}
              rejectionReason={getSlotImage(0)?.rejectionReason}
              isMain={true}
              retryCount={getSlotImage(0)?.retryCount}
              imageId={getSlotImage(0)?.id}
              isReviewed={getSlotImage(0)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[0]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => { imageSelectorRefs.current[0] = el; }}
                size="lg"
                value={getSlotImage(0)?.url}
                onChange={(value) => handleImageChange(0, value)}
              />
            </PhotoStatusWrapper>
          </View>

          <View style={styles.subImagesContainer}>
            <PhotoStatusWrapper
              reviewStatus={getSlotImage(1)?.reviewStatus}
              rejectionReason={getSlotImage(1)?.rejectionReason}
              isMain={false}
              retryCount={getSlotImage(1)?.retryCount}
              imageId={getSlotImage(1)?.id}
              isReviewed={getSlotImage(1)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[1]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => { imageSelectorRefs.current[1] = el; }}
                size="sm"
                value={getSlotImage(1)?.url}
                onChange={(value) => handleImageChange(1, value)}
              />
            </PhotoStatusWrapper>

            <PhotoStatusWrapper
              reviewStatus={getSlotImage(2)?.reviewStatus}
              rejectionReason={getSlotImage(2)?.rejectionReason}
              isMain={false}
              retryCount={getSlotImage(2)?.retryCount}
              imageId={getSlotImage(2)?.id}
              isReviewed={getSlotImage(2)?.isReviewed}
              onReupload={() => imageSelectorRefs.current[2]?.openPicker()}
              onMarkAsReviewed={handleMarkAsReviewed}
            >
              <ImageSelector
                ref={(el) => { imageSelectorRefs.current[2] = el; }}
                size="sm"
                value={getSlotImage(2)?.url}
                onChange={(value) => handleImageChange(2, value)}
              />
            </PhotoStatusWrapper>
          </View>
        </View>

        <View style={styles.guideContainer}>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t('features.mypage.profile_image_change.guide')}
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t('apps.auth.sign_up.profile_image.info_desc_2')}
          </Text>
        </View>

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
