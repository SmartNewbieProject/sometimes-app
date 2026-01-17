import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useState, useEffect, useCallback } from 'react';
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
	const [containerSize, setContainerSize] = useState<ImageSize>({
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
	});
	const [isReady, setIsReady] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const opacity = useSharedValue(0);
	const translateY = useSharedValue(50);

	const displayImageSize =
		imageSize.width > 0
			? {
					width: Math.min(imageSize.width, SCREEN_WIDTH * 2),
					height: Math.min(imageSize.height, SCREEN_HEIGHT * 2),
				}
			: { width: cropSize, height: cropSize };

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
		if (isReady && displayImageSize.width > 0) {
			initializeTransform();
		}
	}, [isReady, displayImageSize, initializeTransform]);

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

			const cropResult = calcCropResult(
				displayImageSize,
				cropSize,
				scale,
				currentTranslateX,
				currentTranslateY,
				rotation,
			);

			const actions: ImageManipulator.Action[] = [];

			if (rotation !== 0) {
				actions.push({ rotate: rotation });
			}

			actions.push({
				crop: {
					originX: cropResult.originX,
					originY: cropResult.originY,
					width: cropResult.width,
					height: cropResult.height,
				},
			});

			const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
				compress: 0.9,
				format: ImageManipulator.SaveFormat.JPEG,
			});

			onComplete(result.uri);
		} catch (error) {
			console.error('Crop failed:', error);
			onComplete(imageUri);
		} finally {
			setIsProcessing(false);
		}
	}, [isProcessing, isReady, transform, displayImageSize, cropSize, imageUri, onComplete]);

	const handleCancel = useCallback(() => {
		if (isProcessing) return;
		onCancel();
	}, [isProcessing, onCancel]);

	const handleContainerLayout = useCallback(
		(event: { nativeEvent: { layout: { width: number; height: number } } }) => {
			const { width, height } = event.nativeEvent.layout;
			setContainerSize({ width, height });
		},
		[],
	);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	if (!isVisible) return null;

	const content = (
		<Animated.View style={[styles.container, animatedStyle]} onLayout={handleContainerLayout}>
			<CropHeader onCancel={handleCancel} onComplete={handleComplete} isProcessing={isProcessing} />

			{isReady && displayImageSize.width > 0 && (
				<CropCanvas
					imageUri={imageUri}
					cropSize={cropSize}
					transform={transform}
					imageSize={displayImageSize}
					containerSize={containerSize}
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
