import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { Portal } from '../../providers/portal-provider';
import { CropCanvas } from './crop-canvas';
import { CropHeader } from './crop-header';
import { CropToolbar } from './crop-toolbar';
import { calcCropResult, normalizeRotation } from './crop-utils';
import type { ImageCropModalProps, ImageSize } from './types';
import { useCropTransform } from './use-crop-transform';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_CROP_SIZE = Math.min(SCREEN_WIDTH - 40, SCREEN_HEIGHT * 0.5);

export function ImageCropModal({
	visible,
	imageUri,
	onComplete,
	onCancel,
	cropSize = DEFAULT_CROP_SIZE,
}: ImageCropModalProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
	const [originalImageSize, setOriginalImageSize] = useState<ImageSize>({ width: 0, height: 0 });
	const [isReady, setIsReady] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const opacity = useSharedValue(0);
	const translateY = useSharedValue(50);
	const initializedForUri = useRef<string | null>(null);

	// displayImageSize는 imageSize와 동일하게 사용 (이미 적절히 스케일링됨)
	const displayImageSize = useMemo(() => {
		if (imageSize.width > 0 && imageSize.height > 0) {
			return { width: imageSize.width, height: imageSize.height };
		}
		return { width: cropSize, height: cropSize };
	}, [imageSize.width, imageSize.height, cropSize]);

	const { transform, initializeTransform, rotateBy90 } = useCropTransform(
		displayImageSize,
		cropSize,
	);

	useEffect(() => {
		if (visible) {
			setIsVisible(true);
			opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
			translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.ease) });
		} else {
			opacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
			translateY.value = withTiming(50, { duration: 150, easing: Easing.in(Easing.ease) });
			setTimeout(() => {
				setIsVisible(false);
			}, 150);
		}
	}, [visible, opacity, translateY]);

	useEffect(() => {
		if (visible && imageUri) {
			setIsReady(false);
			Image.prefetch(imageUri);

			if (Platform.OS === 'web') {
				const img = new window.Image();
				img.onload = () => {
					setOriginalImageSize({ width: img.width, height: img.height });
					const maxDimension = Math.max(SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);
					const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
					setImageSize({
						width: img.width * scale,
						height: img.height * scale,
					});
					setIsReady(true);
				};
				img.src = imageUri;
			} else {
				ImageManipulator.manipulateAsync(imageUri, [], { compress: 1 })
					.then((result) => {
						setOriginalImageSize({ width: result.width, height: result.height });
						const maxDimension = Math.max(SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);
						const scale = Math.min(1, maxDimension / Math.max(result.width, result.height));
						setImageSize({
							width: result.width * scale,
							height: result.height * scale,
						});
						setIsReady(true);
					})
					.catch(() => {
						setImageSize({ width: cropSize, height: cropSize });
						setIsReady(true);
					});
			}
		}
	}, [visible, imageUri, cropSize]);

	useEffect(() => {
		// 같은 이미지에 대해서는 한 번만 초기화
		if (isReady && displayImageSize.width > 0 && imageUri && initializedForUri.current !== imageUri) {
			initializedForUri.current = imageUri;
			initializeTransform();
		}
	}, [isReady, displayImageSize, initializeTransform, imageUri]);

	const handleRotate = useCallback(() => {
		rotateBy90();
	}, [rotateBy90]);

	const handleComplete = useCallback(async () => {
		if (isProcessing || !isReady) return;

		setIsProcessing(true);

		try {
			const rotation = normalizeRotation(transform.rotation.value);
			const scale = transform.scale.value;
			const currentTranslateX = transform.translateX.value;
			const currentTranslateY = transform.translateY.value;

			console.log('[ImageCropModal] handleComplete - transform values:', {
				rotation,
				scale,
				translateX: currentTranslateX,
				translateY: currentTranslateY,
			});
			console.log('[ImageCropModal] handleComplete - sizes:', {
				originalImageSize,
				imageSize,
				displayImageSize,
				cropSize,
			});

			const cropResult = calcCropResult(
				displayImageSize,
				cropSize,
				scale,
				currentTranslateX,
				currentTranslateY,
				rotation,
			);

			console.log('[ImageCropModal] handleComplete - cropResult (displayImageSize 기준):', cropResult);

			// displayImageSize -> originalImageSize 변환 비율
			const displayToOriginalRatio = originalImageSize.width / displayImageSize.width;

			console.log('[ImageCropModal] handleComplete - displayToOriginalRatio:', displayToOriginalRatio);

			// 원본 이미지 좌표로 변환
			const originalCropResult = {
				originX: Math.round(cropResult.originX * displayToOriginalRatio),
				originY: Math.round(cropResult.originY * displayToOriginalRatio),
				width: Math.round(cropResult.width * displayToOriginalRatio),
				height: Math.round(cropResult.height * displayToOriginalRatio),
			};

			console.log('[ImageCropModal] handleComplete - originalCropResult:', originalCropResult);
			console.log('[ImageCropModal] handleComplete - 원본 이미지 범위 체크:', {
				validX: originalCropResult.originX >= 0 && originalCropResult.originX + originalCropResult.width <= originalImageSize.width,
				validY: originalCropResult.originY >= 0 && originalCropResult.originY + originalCropResult.height <= originalImageSize.height,
			});

			const actions: ImageManipulator.Action[] = [];

			if (rotation !== 0) {
				actions.push({ rotate: rotation });
			}

			actions.push({
				crop: {
					originX: originalCropResult.originX,
					originY: originalCropResult.originY,
					width: originalCropResult.width,
					height: originalCropResult.height,
				},
			});

			const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
				compress: 0.9,
				format: ImageManipulator.SaveFormat.JPEG,
			});

			// 먼저 닫기 애니메이션 시작 (현재 crop 상태 유지)
			opacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
			translateY.value = withTiming(50, { duration: 150, easing: Easing.in(Easing.ease) });

			// 애니메이션 후 콜백 호출
			setTimeout(() => {
				setIsVisible(false);
				setIsProcessing(false);
				onComplete(result.uri);
			}, 160);
		} catch (error) {
			console.error('Crop failed:', error);
			setIsProcessing(false);
			onComplete(imageUri);
		}
	}, [isProcessing, isReady, transform, displayImageSize, originalImageSize, cropSize, imageUri, onComplete, opacity, translateY]);

	const handleCancel = useCallback(() => {
		if (isProcessing) return;
		onCancel();
	}, [isProcessing, onCancel]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	if (!isVisible) return null;

	const content = (
		<Animated.View style={[styles.container, animatedStyle]}>
			<CropHeader onCancel={handleCancel} onComplete={handleComplete} isProcessing={isProcessing} />

			{isReady && displayImageSize.width > 0 && (
				<CropCanvas
					imageUri={imageUri}
					cropSize={cropSize}
					transform={transform}
					imageSize={displayImageSize}
				/>
			)}

			<CropToolbar onRotate={handleRotate} />
		</Animated.View>
	);

	const modalContent = (
		<View style={styles.overlay}>
			{Platform.OS === 'web' ? (
				content
			) : (
				<GestureHandlerRootView style={styles.gestureRoot}>{content}</GestureHandlerRootView>
			)}
		</View>
	);

	return <Portal name="image-crop-modal">{modalContent}</Portal>;
}

export type { ImageCropModalProps } from './types';

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1000,
	},
	gestureRoot: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: '#000000',
	},
});
