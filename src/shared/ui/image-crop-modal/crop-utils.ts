import type { CropBounds, CropResult, ImageSize } from './types';

export function clamp(value: number, min: number, max: number): number {
	'worklet';
	return Math.min(Math.max(value, min), max);
}

export function getRotatedImageSize(imageSize: ImageSize, rotation: number): ImageSize {
	'worklet';
	const normalizedRotation = ((rotation % 360) + 360) % 360;
	if (normalizedRotation === 90 || normalizedRotation === 270) {
		return { width: imageSize.height, height: imageSize.width };
	}
	return { width: imageSize.width, height: imageSize.height };
}

export function calcMinScale(imageSize: ImageSize, cropSize: number, rotation: number): number {
	'worklet';
	const rotated = getRotatedImageSize(imageSize, rotation);
	return Math.max(cropSize / rotated.width, cropSize / rotated.height);
}

export function calcBounds(
	imageSize: ImageSize,
	cropSize: number,
	scale: number,
	rotation: number,
): CropBounds {
	'worklet';
	const rotated = getRotatedImageSize(imageSize, rotation);
	const scaledW = rotated.width * scale;
	const scaledH = rotated.height * scale;

	const maxX = Math.max((scaledW - cropSize) / 2, 0);
	const maxY = Math.max((scaledH - cropSize) / 2, 0);

	return {
		minX: -maxX,
		maxX: maxX,
		minY: -maxY,
		maxY: maxY,
	};
}

export function calcCropResult(
	imageSize: ImageSize,
	cropSize: number,
	scale: number,
	translateX: number,
	translateY: number,
	rotation: number,
): CropResult {
	const rotated = getRotatedImageSize(imageSize, rotation);

	const scaledW = rotated.width * scale;
	const scaledH = rotated.height * scale;

	const cropSizeInOriginal = cropSize / scale;

	const centerX = rotated.width / 2;
	const centerY = rotated.height / 2;

	const offsetX = -translateX / scale;
	const offsetY = -translateY / scale;

	const originX = centerX + offsetX - cropSizeInOriginal / 2;
	const originY = centerY + offsetY - cropSizeInOriginal / 2;

	return {
		originX: Math.max(0, Math.round(originX)),
		originY: Math.max(0, Math.round(originY)),
		width: Math.round(cropSizeInOriginal),
		height: Math.round(cropSizeInOriginal),
	};
}

export function normalizeRotation(rotation: number): number {
	return ((rotation % 360) + 360) % 360;
}
