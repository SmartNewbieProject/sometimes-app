import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import type { SimultaneousGesture } from 'react-native-gesture-handler';
import { calcBounds, calcMinScale, clamp } from './crop-utils';
import type { CropTransformState, ImageSize } from './types';

const MAX_SCALE = 5;

interface UseCropGestureParams {
	transform: CropTransformState;
	imageSize: ImageSize;
	cropSize: number;
}

interface WebGestureHandlers {
	onPointerDown: (e: any) => void;
	onPointerMove: (e: any) => void;
	onPointerUp: () => void;
	onWheel: (e: any) => void;
}

export function useCropGesture({ transform, imageSize, cropSize }: UseCropGestureParams): {
	nativeGesture: SimultaneousGesture;
	webHandlers: WebGestureHandlers;
} {
	const { scale, translateX, translateY, rotation, savedScale, savedTranslateX, savedTranslateY } =
		transform;

	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const startYRef = useRef(0);

	const panGesture = Gesture.Pan()
		.onStart(() => {
			'worklet';
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		})
		.onUpdate((e) => {
			'worklet';
			const bounds = calcBounds(imageSize, cropSize, scale.value, rotation.value);
			translateX.value = clamp(savedTranslateX.value + e.translationX, bounds.minX, bounds.maxX);
			translateY.value = clamp(savedTranslateY.value + e.translationY, bounds.minY, bounds.maxY);
		})
		.onEnd(() => {
			'worklet';
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	const pinchGesture = Gesture.Pinch()
		.onStart(() => {
			'worklet';
			savedScale.value = scale.value;
		})
		.onUpdate((e) => {
			'worklet';
			const minScale = calcMinScale(imageSize, cropSize, rotation.value);
			scale.value = clamp(savedScale.value * e.scale, minScale, MAX_SCALE);

			const bounds = calcBounds(imageSize, cropSize, scale.value, rotation.value);
			translateX.value = clamp(translateX.value, bounds.minX, bounds.maxX);
			translateY.value = clamp(translateY.value, bounds.minY, bounds.maxY);
		})
		.onEnd(() => {
			'worklet';
			savedScale.value = scale.value;
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	const nativeGesture = Gesture.Simultaneous(panGesture, pinchGesture);

	const handlePointerDown = useCallback(
		(e: any) => {
			if (Platform.OS !== 'web') return;
			isDraggingRef.current = true;
			startXRef.current = e.nativeEvent?.pageX ?? e.pageX ?? 0;
			startYRef.current = e.nativeEvent?.pageY ?? e.pageY ?? 0;
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		},
		[savedTranslateX, savedTranslateY, translateX, translateY],
	);

	const handlePointerMove = useCallback(
		(e: any) => {
			if (Platform.OS !== 'web' || !isDraggingRef.current) return;

			const currentX = e.nativeEvent?.pageX ?? e.pageX ?? 0;
			const currentY = e.nativeEvent?.pageY ?? e.pageY ?? 0;
			const deltaX = currentX - startXRef.current;
			const deltaY = currentY - startYRef.current;

			const bounds = calcBounds(imageSize, cropSize, scale.value, rotation.value);
			translateX.value = clamp(savedTranslateX.value + deltaX, bounds.minX, bounds.maxX);
			translateY.value = clamp(savedTranslateY.value + deltaY, bounds.minY, bounds.maxY);
		},
		[
			imageSize,
			cropSize,
			scale,
			rotation,
			savedTranslateX,
			savedTranslateY,
			translateX,
			translateY,
		],
	);

	const handlePointerUp = useCallback(() => {
		if (Platform.OS !== 'web') return;
		isDraggingRef.current = false;
		savedTranslateX.value = translateX.value;
		savedTranslateY.value = translateY.value;
	}, [savedTranslateX, savedTranslateY, translateX, translateY]);

	const handleWheel = useCallback(
		(e: any) => {
			if (Platform.OS !== 'web') return;
			e.preventDefault?.();

			const delta = e.deltaY ?? 0;
			const zoomFactor = delta > 0 ? 0.9 : 1.1;
			const minScale = calcMinScale(imageSize, cropSize, rotation.value);
			const newScale = clamp(scale.value * zoomFactor, minScale, MAX_SCALE);

			scale.value = newScale;
			savedScale.value = newScale;

			const bounds = calcBounds(imageSize, cropSize, newScale, rotation.value);
			translateX.value = clamp(translateX.value, bounds.minX, bounds.maxX);
			translateY.value = clamp(translateY.value, bounds.minY, bounds.maxY);
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		},
		[
			imageSize,
			cropSize,
			rotation,
			scale,
			savedScale,
			translateX,
			translateY,
			savedTranslateX,
			savedTranslateY,
		],
	);

	useEffect(() => {
		if (Platform.OS !== 'web') return;

		const handleGlobalPointerUp = () => {
			if (isDraggingRef.current) {
				handlePointerUp();
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('pointerup', handleGlobalPointerUp);
			window.addEventListener('mouseup', handleGlobalPointerUp);
			return () => {
				window.removeEventListener('pointerup', handleGlobalPointerUp);
				window.removeEventListener('mouseup', handleGlobalPointerUp);
			};
		}
	}, [handlePointerUp]);

	return {
		nativeGesture,
		webHandlers: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onWheel: handleWheel,
		},
	};
}
