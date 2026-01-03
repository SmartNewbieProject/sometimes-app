import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Badge } from '@/src/shared/ui/badge';
import { Text } from '@/src/shared/ui/text';
import { useTranslation } from 'react-i18next';
import { useModal } from '@/src/shared/hooks/use-modal';

interface PhotoStatusWrapperProps {
  reviewStatus?: string;
  rejectionReason?: string | null;
  isMain?: boolean;
  retryCount?: number;
  imageId?: string;
  isReviewed?: boolean;
  onReupload?: () => void;
  onMarkAsReviewed?: (imageId: string) => void;
  children: React.ReactNode;
}

export function PhotoStatusWrapper({
  reviewStatus,
  rejectionReason,
  isMain,
  retryCount = 0,
  imageId,
  isReviewed = false,
  onReupload,
  onMarkAsReviewed,
  children,
}: PhotoStatusWrapperProps) {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const normalizedStatus = reviewStatus?.toUpperCase();
  const isRejected = normalizedStatus === 'REJECTED';
  const isPending = normalizedStatus === 'PENDING';
  const isApproved = normalizedStatus === 'APPROVED';
  const maxRetryExceeded = retryCount >= 3;

  const handleShowRejectionDetail = (e: any) => {
    e.stopPropagation();
    showModal({
      title: t("common.거절_사유"),
      children: rejectionReason || t('features.mypage.image-modal.no_reason'),
      primaryButton: {
        text: t("common.확인"),
        onClick: () => {},
      },
    });
  };

  // 거절된 사진이 표시될 때 자동으로 mark-reviewed 호출
  useEffect(() => {
    if (isRejected && !isReviewed && imageId && onMarkAsReviewed) {
      onMarkAsReviewed(imageId);
    }
  }, [isRejected, isReviewed, imageId, onMarkAsReviewed]);

  return (
    <View style={styles.container}>
      {children}

      {/* 상태 Badge (왼쪽 상단) */}
      {(isPending || isApproved) && (
        <View style={styles.statusBadge}>
          <Badge variant={isApproved ? 'approved' : 'pending'}>
            {isApproved ? t('features.mypage.image-modal.approved') : t('features.mypage.image-modal.pending')}
          </Badge>
        </View>
      )}

      {/* 대표 Badge (오른쪽 상단) */}
      {isMain && !isRejected && (
        <View style={styles.mainBadge}>
          <Badge variant="main">{t('features.mypage.image-modal.main')}</Badge>
        </View>
      )}

      {/* 거절 Badge (왼쪽 상단) - 최대 재심사 횟수 초과 시 미표시 */}
      {isRejected && !maxRetryExceeded && (
        <View style={styles.rejectedBadge}>
          <Badge variant="rejected">
            {t('features.mypage.image-modal.rejected')}
          </Badge>
        </View>
      )}

      {/* 거절 오버레이 (전체) - 클릭 시 변경 요청 */}
      {isRejected && (
        <Pressable
          style={styles.rejectedOverlay}
          onPress={!maxRetryExceeded && onReupload ? onReupload : undefined}
          disabled={maxRetryExceeded || !onReupload}
        >
          <View style={styles.rejectedContent}>
            <View style={styles.reasonContainer}>
              <Text
                weight="medium"
                size="xs"
                textColor="white"
                style={styles.reasonText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {rejectionReason || t('features.mypage.image-modal.no_reason')}
              </Text>
              {rejectionReason && rejectionReason.length > 30 && (
                <Pressable onPress={handleShowRejectionDetail} style={styles.detailButton}>
                  <Text weight="medium" size="xs" textColor="white" style={styles.detailButtonText}>
                    자세히 보기
                  </Text>
                </Pressable>
              )}
            </View>

            {/* 재시도 횟수 표시 */}
            {retryCount > 0 && (
              <Text
                weight="medium"
                size="xs"
                textColor="white"
                style={styles.retryCountText}
              >
                {t('features.mypage.image-modal.retry_count', { current: retryCount, max: 3 })}
              </Text>
            )}

            {/* 재업로드 버튼 또는 제한 메시지 */}
            {maxRetryExceeded ? (
              <View style={styles.maxRetryContainer}>
                <Text weight="bold" size="xs" textColor="white" style={styles.maxRetryText}>
                  {t('features.mypage.image-modal.max_retry_exceeded')}
                </Text>
                <Text weight="medium" size="xs" textColor="white" style={styles.contactText}>
                  {t('features.mypage.image-modal.contact_support')}
                </Text>
              </View>
            ) : (
              <View style={styles.reuploadButton}>
                <Text weight="bold" size="xs" textColor="black">
                  {t('features.mypage.image-modal.change_photo')}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  mainBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  rejectedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 30,
  },
  rejectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    zIndex: 20,
  },
  rejectedContent: {
    alignItems: 'center',
    gap: 8,
  },
  reasonContainer: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
    paddingHorizontal: 8,
  },
  reasonText: {
    textAlign: 'center',
    lineHeight: 14.4,
    fontSize: 10,
  },
  detailButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  detailButtonText: {
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
  retryCountText: {
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  maxRetryContainer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  maxRetryText: {
    textAlign: 'center',
  },
  contactText: {
    textAlign: 'center',
    opacity: 0.9,
  },
  reuploadButton: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});
