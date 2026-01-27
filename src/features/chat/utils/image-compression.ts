import { Platform } from 'react-native';
import { type CompressionConfig, compressImageNative, compressImageWeb } from './image';

export interface ImageCompressionOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: 'jpeg' | 'png';
}

export async function compressImage(
	uri: string,
	options: ImageCompressionOptions = {},
): Promise<string> {
	const config: CompressionConfig = {
		maxWidth: options.maxWidth || 800,
		maxHeight: options.maxHeight || 800,
		quality: options.quality || 0.7,
		format: options.format || 'jpeg',
	};
	const result =
		Platform.OS === 'web'
			? await compressImageWeb(uri, config)
			: await compressImageNative(uri, config);
	return result.base64;
}

export function getImageSizeFromBase64(base64: string): number {
	const base64Data = base64.split(',')[1] || base64;
	return Math.round((base64Data.length * 3) / 4);
}

export function isImageTooLarge(base64: string, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
	return getImageSizeFromBase64(base64) > maxSizeBytes;
}
