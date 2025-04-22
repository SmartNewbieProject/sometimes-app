import React, { useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ImageResources } from '@/src/shared/libs/image';
import imageUtils from '@/src/shared/libs/image';
import { Lottie } from '@/src/shared/ui/lottie';
import Loading from '@/src/features/loading';

export interface ImageResourceProps {
  resource: ImageResources;
  width?: number;
  height?: number;
  className?: string;
  style?: ViewStyle;
  loadingTitle?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number;
}

export const ImageResource: React.FC<ImageResourceProps> = ({
  resource,
  width = 100,
  height = 100,
  className = '',
  style,
  loadingTitle = '이미지를 불러오고 있어요',
  contentFit = 'cover',
  borderRadius = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = imageUtils.get(resource);

  const styles = StyleSheet.create({
    container: {
      width,
      height,
      borderRadius,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]} className={className}>
      <Loading.Lottie title={loadingTitle} loading={isLoading}>
        <ExpoImage
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit={contentFit}
          onLoadStart={handleLoadStart}
          onLoad={handleLoadEnd}
          onError={handleError}
          transition={300}
        />
      </Loading.Lottie>
    </View>
  );
};
