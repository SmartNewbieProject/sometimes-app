import React from 'react';
import { View, StyleSheet, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { semanticColors } from '@/src/shared/constants/colors';
import { Badge } from '@/src/shared/ui/badge';
import { Text } from '@/src/shared/ui/text';
import MoreIcon from '@/assets/icons/vertical-ellipsis.svg';

export interface ProfilePhoto {
  id: string;
  url: string;
  reviewStatus?: string;
  isMain: boolean;
  order: number;
  rejectionReason?: string | null;
}

interface ProfilePhotoCardProps {
  photo: ProfilePhoto;
  onMorePress?: (photo: ProfilePhoto) => void;
  onReuploadPress?: (photo: ProfilePhoto) => void;
}

export function ProfilePhotoCard({
  photo,
  onMorePress,
  onReuploadPress,
}: ProfilePhotoCardProps) {
  const isRejected = photo.reviewStatus === 'REJECTED';
  const isApproved = photo.reviewStatus === 'APPROVED';
  const isReviewing = photo.reviewStatus === 'REVIEWING';

  const getBadgeVariant = (): 'approved' | 'reviewing' | 'rejected' => {
    if (isApproved) return 'approved';
    if (isReviewing) return 'reviewing';
    return 'rejected';
  };

  const getBadgeText = () => {
    if (isApproved) return '승인됨';
    if (isReviewing) return '심사중';
    return '거절됨';
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: photo.url }}
        style={styles.image}
        contentFit="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={
          isRejected
            ? ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.6)']
            : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']
        }
        style={styles.gradient}
      >
        {/* Header Area */}
        <View style={styles.header}>
          <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>

          {/* Right Side: Main Badge or More Button */}
          <View style={styles.headerRight}>
            {photo.isMain && (
              <View style={styles.mainBadge}>
                <Text weight="bold" size="xs" textColor="white">
                  대표
                </Text>
              </View>
            )}
            {(isApproved || photo.isMain) && onMorePress && (
              <Pressable
                style={styles.moreButton}
                onPress={() => onMorePress(photo)}
              >
                <MoreIcon width={24} height={24} fill="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Rejected Content (Centered) */}
        {isRejected && (
          <View style={styles.rejectedContent}>
            <Text
              weight="medium"
              size="xs"
              textColor="white"
              style={styles.rejectedText}
            >
              {photo.rejectionReason || '사유 미기재'}
            </Text>
            {onReuploadPress && (
              <Pressable
                style={styles.reuploadButton}
                onPress={() => onReuploadPress(photo)}
              >
                <Text weight="bold" size="xs" textColor="black">
                  변경하기
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Footer Area (if needed) */}
        <View style={styles.footer} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: semanticColors.border.smooth,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mainBadge: {
    backgroundColor: semanticColors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  moreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectedContent: {
    position: 'absolute',
    top: '50%',
    left: 12,
    right: 12,
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    gap: 8,
  },
  rejectedText: {
    textAlign: 'center',
    lineHeight: 16.8,
  },
  reuploadButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
