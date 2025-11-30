import { useState } from 'react';
import { semanticColors } from '../../constants/colors';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { ImageResourceProps } from './index';
import Loading from '@/src/features/loading';

export const ImageResource: React.FC<ImageResourceProps> = ({
  resource,
  width = 100,
  height = 100,
  style,
  loadingTitle = '이미지를 불러오고 있어요',
  contentFit = 'cover',
  borderRadius = 0,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    setHasError(false);
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: unknown) => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.image, { backgroundColor: semanticColors.surface.background }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Loading.Lottie title={loadingTitle} loading={isLoading}>
        <ExpoImage
          source={{ uri: resource.toString() }}
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