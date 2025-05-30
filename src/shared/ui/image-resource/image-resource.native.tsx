import { useState } from 'react';
import { Image as ExpoImage, useImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { ImageResourceProps } from './index';
import Loading from '@/src/features/loading';

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
  const [hasError, setHasError] = useState(false);
  const image = useImage(resource, {
    onError: (error) => {
      setHasError(true);
    },
  });

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
  };

  const handleError = (error: unknown) => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[styles.container, style]} className={className}>
        <View style={[styles.image, { backgroundColor: '#F3EDFF' }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} className={className}>
      <Loading.Lottie title={loadingTitle} loading={!image}>
        <ExpoImage
          source={image}
          style={styles.image}
          contentFit={contentFit}
          onLoadStart={handleLoadStart}
          onError={handleError}
          transition={300}
        />
      </Loading.Lottie>
    </View>
  );
}; 