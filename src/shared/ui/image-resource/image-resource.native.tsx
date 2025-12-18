import { useState, useEffect, useRef } from 'react';
import { semanticColors } from '../../constants/semantic-colors';
import { Image as ExpoImage, useImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { ImageResourceProps } from './index';
import Loading from '@/src/features/loading';
import { Text } from '@/src/shared/ui';
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
  const isMounted = useRef(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const image = useImage(resource, {
    onError: (error) => {
      if (isMounted.current) {
        console.error('[ImageResource] Error loading image:', error);
        setHasError(true);
      }
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
    if (isMounted.current) {
      setHasError(false);
    }
  };

  const handleError = (error: unknown) => {
    if (isMounted.current) {
      console.error('[ImageResource] ExpoImage error:', error);
      setHasError(true);
    }
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

  return (
    <View style={[styles.container, style]}>
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