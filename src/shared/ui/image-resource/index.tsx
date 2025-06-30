import type { ImageResources } from '@/src/shared/libs/image';
import type { ViewStyle } from 'react-native';

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

export { ImageResource } from './image-resource';
