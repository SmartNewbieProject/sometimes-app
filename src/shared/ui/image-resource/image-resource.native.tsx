import { useState } from 'react';
import { semanticColors } from '../../constants/colors';
import { Image as ExpoImage, useImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { ImageResourceProps } from './index';
import { Text } from '@/src/shared/ui/text';
import { CustomInfiniteScrollView } from '../../infinite-scroll/custom-infinite-scroll-view';

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
  const image = useImage(resource, {
    onError: (error) => {
      console.error(error);
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
    imageLoading: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
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
      <View style={[styles.container, style]}>
        <View style={[styles.image, { backgroundColor: semanticColors.surface.background }]}>
          <Text>이미지 로드 실패</Text>
        </View>
      </View>
    );
  }

  if (!image) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.imageLoading, { backgroundColor: semanticColors.surface.background }]}>
          <Text>{loadingTitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={image}
        style={styles.image}
        contentFit={contentFit}
        onLoadStart={handleLoadStart}
        onError={handleError}
        transition={300}
      />
    </View>
  );
}; 