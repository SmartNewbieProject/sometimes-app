import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';

export interface ImageCompressionProgressProps {
  progress: number;
  currentImage?: number;
  totalImages?: number;
  visible: boolean;
}

export function ImageCompressionProgress({
  progress,
  currentImage,
  totalImages,
  visible,
}: ImageCompressionProgressProps) {
  if (!visible) return null;

  const progressPercent = Math.round(progress);
  const hasMultipleImages = totalImages && totalImages > 1;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryPurple} />

        <Text style={styles.title}>이미지 최적화 중...</Text>

        {hasMultipleImages && currentImage && (
          <Text style={styles.imageCount}>
            {currentImage} / {totalImages}
          </Text>
        )}

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` }
            ]}
          />
        </View>

        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  imageCount: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.lightPurple,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryPurple,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryPurple,
  },
});
