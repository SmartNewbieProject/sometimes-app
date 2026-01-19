import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';
import { useTranslation } from 'react-i18next';

interface BlurredPhotoCardProps {
  skippedPhotoCount: number;
  showCTA?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  sampleImageUrl?: string;
}

export function BlurredPhotoCard({
  skippedPhotoCount,
  showCTA = false,
  size = 'md',
  sampleImageUrl,
}: BlurredPhotoCardProps) {
  const { t } = useTranslation();

  const handleAddPhotoPress = () => {
    router.push('/profile/photo-management?referrer=home');
  };

  const sizeStyles = {
    sm: styles.containerSm,
    md: styles.containerMd,
    lg: styles.containerLg,
    full: styles.containerFull,
  };

  return (
    <View style={[styles.container, sizeStyles[size]]}>
      {/* 배경 이미지 */}
      {sampleImageUrl ? (
        <Image
          source={{ uri: sampleImageUrl }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.emptyBackground} />
      )}

      {/* 블러 오버레이 */}
      <BlurView intensity={20} style={styles.blurOverlay} tint="dark" />

      {/* 컨텐츠 */}
      <View style={styles.content}>
        {/* 메시지 */}
        <Text weight="bold" size="lg" textColor="white" style={styles.message}>
          {t('features.matching.blur_photo.message', { count: skippedPhotoCount })}
        </Text>

        {/* Sub Description */}
        <Text weight="medium" size="sm" textColor="white" style={styles.subDescription}>
          {t('features.matching.blur_photo.sub_description')}
        </Text>

        {/* CTA 버튼 */}
        {showCTA && (
          <Pressable style={styles.ctaButton} onPress={handleAddPhotoPress}>
            <Text weight="bold" size="md" textColor="black">
              {t('features.matching.blur_photo.add_photo_cta')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  containerSm: {
    width: 100,
    height: 100,
  },
  containerMd: {
    width: 150,
    height: 150,
  },
  containerLg: {
    width: 200,
    height: 200,
  },
  containerFull: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  emptyBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  message: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subDescription: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    minWidth: 200,
  },
});
