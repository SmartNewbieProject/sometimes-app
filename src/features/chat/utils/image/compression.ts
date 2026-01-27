import * as ImageManipulator from 'expo-image-manipulator';
import { calculateResizeDimensions } from './resize';

export interface CompressionConfig {
	maxWidth: number;
	maxHeight: number;
	quality: number;
	format: 'jpeg' | 'png';
}

export interface CompressionResult {
	uri: string;
	base64: string;
	size: {
		original: number;
		compressed: number;
		compressionRate: string;
	};
}

export async function compressImageNative(
	uri: string,
	config: CompressionConfig,
): Promise<CompressionResult> {
	const { maxWidth, maxHeight, quality, format } = config;

	const manipulatedImage = await ImageManipulator.manipulateAsync(
		uri,
		[
			{
				resize: {
					width: maxWidth,
					height: maxHeight,
				},
			},
		],
		{
			compress: quality,
			format:
				format === 'jpeg' ? ImageManipulator.SaveFormat.JPEG : ImageManipulator.SaveFormat.PNG,
			base64: true,
		},
	);

	if (!manipulatedImage.base64) {
		throw new Error('압축된 이미지 base64 생성 실패');
	}

	const compressedBase64 = `data:image/${format};base64,${manipulatedImage.base64}`;
	const originalSize = uri.length;
	const compressedSize = compressedBase64.length;
	const compressionRate = `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`;

	return {
		uri: manipulatedImage.uri,
		base64: compressedBase64,
		size: {
			original: originalSize,
			compressed: compressedSize,
			compressionRate,
		},
	};
}
