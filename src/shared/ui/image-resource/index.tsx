import { useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { ImageResources } from '@/src/shared/libs/image';
import Loading from '@/src/features/loading';
import { WebView } from 'react-native-webview';

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

  const imageUrl = resource.toString();

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

  const handleError = (error: unknown) => {
    console.error('Image loading error:', error);
    setIsLoading(false);
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
      <Loading.Lottie title={loadingTitle} loading={isLoading}>
        <WebView
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit={contentFit}
          onLoadStart={handleLoadStart} 
          onLoad={handleLoadEnd}
          onError={handleError}
        />
      </Loading.Lottie>
    </View>
  );
};
