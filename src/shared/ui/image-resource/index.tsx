import type { ViewStyle } from 'react-native';
import type { ImageResources } from '@/src/shared/libs/image';

export interface ImageResourceProps {
  resource: ImageResources;
  width?: number;
  height?: number;
  style?: ViewStyle;
  loadingTitle?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number;
}

export { ImageResource } from './image-resource';
