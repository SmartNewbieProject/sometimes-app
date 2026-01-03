import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Badge } from '@/src/shared/ui/badge';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui/button';
import type { ProfileImage } from '@/src/types/user';
import { useTranslation } from 'react-i18next';

interface PhotoGridProps {
  photos: ProfileImage[];
  onPhotoClick?: (photo: ProfileImage, index: number) => void;
  onMoreClick?: (photo: ProfileImage, index: number) => void;
  onChangeRejectedPhoto?: (photo: ProfileImage) => void;
}

export function PhotoGrid({ photos, onPhotoClick, onMoreClick, onChangeRejectedPhoto }: PhotoGridProps) {
  const { t } = useTranslation();
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);
  const displayPhotos = sortedPhotos.slice(0, 3);

  const getStatusVariant = (status?: string): 'approved' | 'reviewing' | 'rejected' => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    return 'reviewing';
  };

  const getStatusLabel = (status?: string): string => {
    if (status === 'APPROVED') return t('features.mypage.image-modal.approved');
    if (status === 'REJECTED') return t('features.mypage.image-modal.rejected');
    return t('features.mypage.image-modal.reviewing');
  };

  const renderPhoto = (photo: ProfileImage, index: number, isMain: boolean) => {
    const isRejected = photo.reviewStatus === 'REJECTED';

    return (
      <Pressable
        key={photo.id}
        style={({ pressed }) => [
          isMain ? styles.mainPhoto : styles.smallPhoto,
          photo.isMain && styles.mainPhotoBorder,
          pressed && !isRejected && styles.photoPressed,
        ]}
        onPress={() => !isRejected && onPhotoClick?.(photo, index)}
        disabled={isRejected}
      >
        <Image source={{ uri: photo.url }} style={styles.photoImage} />

        {isRejected && (
          <View style={styles.rejectedOverlay}>
            <View style={styles.rejectedContent}>
              <Text size="sm" weight="semibold" style={styles.rejectedTitle}>
                {t('features.mypage.profile_status.reject.reason_title')}
              </Text>
              <Text size="xs" style={styles.rejectedReason}>
                {t('features.mypage.profile_status.reject.default_reason')}
              </Text>
              {onChangeRejectedPhoto && (
                <Pressable
                  style={styles.changeButton}
                  onPress={() => onChangeRejectedPhoto(photo)}
                >
                  <Text size="sm" weight="semibold" style={styles.changeButtonText}>
                    {t('features.mypage.image-modal.change_photo')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {photo.reviewStatus && !isRejected && (
          <View style={styles.statusBadge}>
            <Badge variant={getStatusVariant(photo.reviewStatus)}>
              {getStatusLabel(photo.reviewStatus)}
            </Badge>
          </View>
        )}

        {photo.isMain && !isRejected && (
          <View style={styles.mainBadge}>
            <Badge variant="main">{t('features.mypage.image-modal.main')}</Badge>
          </View>
        )}

        {onMoreClick && !isRejected && (
          <Pressable
            style={({ pressed }) => [
              styles.moreButton,
              pressed && styles.moreButtonPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onMoreClick(photo, index);
            }}
          >
            <View style={styles.moreDot} />
            <View style={styles.moreDot} />
            <View style={styles.moreDot} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  if (displayPhotos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        {displayPhotos[0] && renderPhoto(displayPhotos[0], 0, true)}
      </View>
      <View style={styles.rightColumn}>
        {displayPhotos[1] && renderPhoto(displayPhotos[1], 1, false)}
        {displayPhotos[2] && renderPhoto(displayPhotos[2], 2, false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    height: 400,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  mainPhoto: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: semanticColors.surface.surface,
    position: 'relative',
  },
  smallPhoto: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: semanticColors.surface.surface,
    position: 'relative',
  },
  mainPhotoBorder: {
    borderWidth: 3,
    borderColor: semanticColors.brand.primary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPressed: {
    opacity: 0.7,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  mainBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  moreButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  moreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: semanticColors.text.inverse,
    marginVertical: 1,
  },
  rejectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rejectedContent: {
    alignItems: 'center',
  },
  rejectedTitle: {
    color: semanticColors.text.inverse,
    marginBottom: 8,
  },
  rejectedReason: {
    color: semanticColors.text.inverse,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  changeButton: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: semanticColors.text.primary,
  },
});
