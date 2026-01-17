import type { SharedValue } from 'react-native-reanimated';

export interface ImageSize {
	width: number;
	height: number;
}

export interface CropBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export interface CropTransformState {
	scale: SharedValue<number>;
	translateX: SharedValue<number>;
	translateY: SharedValue<number>;
	rotation: SharedValue<number>;
	savedScale: SharedValue<number>;
	savedTranslateX: SharedValue<number>;
	savedTranslateY: SharedValue<number>;
}

export interface CropResult {
	originX: number;
	originY: number;
	width: number;
	height: number;
}

export interface ImageCropModalProps {
	visible: boolean;
	imageUri: string;
	onComplete: (croppedUri: string) => void;
	onCancel: () => void;
	cropSize?: number;
}

export interface CropCanvasProps {
	imageUri: string;
	cropSize: number;
	transform: CropTransformState;
	imageSize: ImageSize;
}

export interface CropOverlayProps {
	cropSize: number;
	containerSize: ImageSize;
}

export interface CropHeaderProps {
	onCancel: () => void;
	onComplete: () => void;
	isProcessing: boolean;
}

export interface CropToolbarProps {
	onRotate: () => void;
}
