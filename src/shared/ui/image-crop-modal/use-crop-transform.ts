import { useCallback, useMemo } from 'react';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { calcBounds, calcMinScale, clamp } from './crop-utils';
import type { CropTransformState, ImageSize } from './types';

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export function useCropTransform(imageSize: ImageSize, cropSize: number) {
	const scale = useSharedValue(MIN_SCALE);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const rotation = useSharedValue(0);

	const savedScale = useSharedValue(MIN_SCALE);
	const savedTranslateX = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);

	const transform: CropTransformState = useMemo(
		() => ({
			scale,
			translateX,
			translateY,
			rotation,
			savedScale,
			savedTranslateX,
			savedTranslateY,
		}),
		[scale, translateX, translateY, rotation, savedScale, savedTranslateX, savedTranslateY],
	);

	const initializeTransform = useCallback(() => {
		'worklet';
		const minScale = calcMinScale(imageSize, cropSize, 0);
		scale.value = minScale;
		savedScale.value = minScale;
		translateX.value = 0;
		translateY.value = 0;
		savedTranslateX.value = 0;
		savedTranslateY.value = 0;
		rotation.value = 0;
	}, [
		imageSize,
		cropSize,
		scale,
		savedScale,
		translateX,
		translateY,
		savedTranslateX,
		savedTranslateY,
		rotation,
	]);

	const rotateBy90 = useCallback(() => {
		'worklet';
		const newRotation = (rotation.value + 90) % 360;
		rotation.value = withTiming(newRotation, { duration: 200 });

		const minScale = calcMinScale(imageSize, cropSize, newRotation);
		const newScale = Math.max(scale.value, minScale);
		scale.value = withTiming(newScale, { duration: 200 });
		savedScale.value = newScale;

		const bounds = calcBounds(imageSize, cropSize, newScale, newRotation);
		const newTranslateX = clamp(translateX.value, bounds.minX, bounds.maxX);
		const newTranslateY = clamp(translateY.value, bounds.minY, bounds.maxY);

		translateX.value = withTiming(newTranslateX, { duration: 200 });
		translateY.value = withTiming(newTranslateY, { duration: 200 });
		savedTranslateX.value = newTranslateX;
		savedTranslateY.value = newTranslateY;
	}, [
		imageSize,
		cropSize,
		rotation,
		scale,
		savedScale,
		translateX,
		translateY,
		savedTranslateX,
		savedTranslateY,
	]);

	const getMinScale = useCallback((): number => {
		return calcMinScale(imageSize, cropSize, rotation.value);
	}, [imageSize, cropSize, rotation]);

	const getMaxScale = useCallback((): number => {
		return MAX_SCALE;
	}, []);

	const getBounds = useCallback(() => {
		return calcBounds(imageSize, cropSize, scale.value, rotation.value);
	}, [imageSize, cropSize, scale, rotation]);

	return {
		transform,
		initializeTransform,
		rotateBy90,
		getMinScale,
		getMaxScale,
		getBounds,
	};
}
